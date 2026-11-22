import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { Session, User } from '@supabase/supabase-js';
import { isSupabaseConfigured, supabase } from '../lib/supabase';
import { UserProfile, UserRole } from '../types';

interface AuthContextValue {
  isConfigured: boolean;
  session: Session | null;
  authUser: User | null;
  profile: UserProfile | null;
  assignedRoles: UserRole[];
  activeRole: UserRole;
  setActiveRole: (role: UserRole) => void;
  loading: boolean;
  profileError: string | null;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (fullName: string, email: string, password: string) => Promise<{ needsEmailConfirmation: boolean }>;
  resetPassword: (email: string) => Promise<void>;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [authUser, setAuthUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [assignedRoles, setAssignedRoles] = useState<UserRole[]>([]);
  const [activeRole, setActiveRoleState] = useState<UserRole>('DOCENTE_INVESTIGADOR_FCI');
  const [loading, setLoading] = useState<boolean>(true);
  const [profileError, setProfileError] = useState<string | null>(null);

  const loadUserProfile = useCallback(async (user: User | null) => {
    if (!supabase || !user) {
      setProfile(null);
      setAssignedRoles([]);
      setProfileError(null);
      return;
    }

    try {
      setProfileError(null);
      const { data: profRow, error: profErr } = await supabase
        .from('profiles')
        .select('*')
        .eq('auth_user_id', user.id)
        .maybeSingle();

      if (profErr) {
        throw new Error(profErr.message);
      }

      if (!profRow) {
        setProfileError(
          'Tu cuenta autenticada aún no está vinculada a un perfil en la tabla public.profiles. Verifica que ejecutaste las migraciones SQL (001 a 005) en Supabase.'
        );
        setProfile(null);
        return;
      }

      if (!profRow.active) {
        setProfileError(
          'Tu cuenta institucional se encuentra inactiva. Contacta al Administrador del Sistema.'
        );
        setProfile(null);
        return;
      }

      const [rolesRes, partRes] = await Promise.all([
        supabase.from('user_roles').select('role').eq('user_id', profRow.id),
        supabase.from('project_participants').select('project_id, fci_projects(code)').eq('user_id', profRow.id)
      ]);

      const roles: UserRole[] =
        rolesRes.data && rolesRes.data.length > 0
          ? rolesRes.data.map((r: any) => r.role as UserRole)
          : ['DOCENTE_INVESTIGADOR_FCI'];

      const projectCodes: string[] = (partRes.data || [])
        .map((p: any) => p.fci_projects?.code)
        .filter(Boolean);

      const loadedProfile: UserProfile = {
        id: profRow.id,
        userCode: profRow.user_code,
        authUserId: profRow.auth_user_id,
        name: profRow.full_name,
        email: profRow.email,
        career: profRow.career,
        faculty: profRow.faculty,
        roles,
        active: profRow.active,
        avatarUrl: profRow.avatar_url || undefined,
        fciProjects: projectCodes
      };

      setProfile(loadedProfile);
      setAssignedRoles(roles);
      setActiveRoleState((prev) => (roles.includes(prev) ? prev : roles[0]));
    } catch (err: any) {
      setProfileError(err?.message || 'Error al cargar el perfil institucional desde Supabase.');
    }
  }, []);

  useEffect(() => {
    if (!isSupabaseConfigured || !supabase) {
      setLoading(false);
      return;
    }

    let mounted = true;

    supabase.auth.getSession().then(async ({ data }) => {
      if (!mounted) return;
      setSession(data.session);
      setAuthUser(data.session?.user ?? null);
      if (data.session?.user) {
        await loadUserProfile(data.session.user);
      }
      if (mounted) setLoading(false);
    });

    const { data: listener } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      setSession(nextSession);
      setAuthUser(nextSession?.user ?? null);
      if (nextSession?.user) {
        loadUserProfile(nextSession.user);
      } else {
        setProfile(null);
        setAssignedRoles([]);
      }
    });

    return () => {
      mounted = false;
      listener.subscription.unsubscribe();
    };
  }, [loadUserProfile]);

  const setActiveRole = (role: UserRole) => {
    if (assignedRoles.includes(role)) {
      setActiveRoleState(role);
    }
  };

  const signIn = async (email: string, password: string) => {
    if (!supabase) throw new Error('Supabase no configurado.');
    const { data, error } = await supabase.auth.signInWithPassword({
      email: email.trim().toLowerCase(),
      password
    });
    if (error) throw new Error(error.message);
    if (data.user) {
      await loadUserProfile(data.user);
    }
  };

  const signUp = async (fullName: string, email: string, password: string) => {
    if (!supabase) throw new Error('Supabase no configurado.');
    const cleanEmail = email.trim().toLowerCase();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)) {
      throw new Error('Ingrese una dirección de correo electrónico válida.');
    }
    const { data, error } = await supabase.auth.signUp({
      email: cleanEmail,
      password,
      options: {
        data: {
          full_name: fullName.trim(),
          career: 'Ingeniería en Telemática'
        }
      }
    });
    if (error) throw new Error(error.message);
    const needsEmailConfirmation = !data.session;
    if (data.session?.user) {
      await loadUserProfile(data.session.user);
    }
    return { needsEmailConfirmation };
  };

  const resetPassword = async (email: string) => {
    if (!supabase) throw new Error('Supabase no configurado.');
    const { error } = await supabase.auth.resetPasswordForEmail(email.trim().toLowerCase(), {
      redirectTo: window.location.origin
    });
    if (error) throw new Error(error.message);
  };

  const signOut = async () => {
    if (!supabase) return;
    await supabase.auth.signOut();
    setProfile(null);
    setAssignedRoles([]);
  };

  const refreshProfile = async () => {
    await loadUserProfile(authUser);
  };

  return (
    <AuthContext.Provider
      value={{
        isConfigured: isSupabaseConfigured,
        session,
        authUser,
        profile,
        assignedRoles,
        activeRole,
        setActiveRole,
        loading,
        profileError,
        signIn,
        signUp,
        resetPassword,
        signOut,
        refreshProfile
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth debe utilizarse dentro de AuthProvider.');
  return ctx;
}
