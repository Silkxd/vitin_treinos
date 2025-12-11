import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { Button } from '../components/common/Button';
import { Input } from '../components/common/Input';
import { Camera, Save, Loader2 } from 'lucide-react';

const profileSchema = z.object({
  name: z.string().min(2, 'Nome deve ter pelo menos 2 caracteres'),
  phone: z.string().optional(),
  bio: z.string().optional(),
});

const passwordSchema = z.object({
  password: z.string().min(6, 'A senha deve ter pelo menos 6 caracteres'),
  confirmPassword: z.string()
}).refine((data) => data.password === data.confirmPassword, {
  message: "As senhas não conferem",
  path: ["confirmPassword"],
});

type ProfileFormData = z.infer<typeof profileSchema>;
type PasswordFormData = z.infer<typeof passwordSchema>;

export const Settings = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [changingPassword, setChangingPassword] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
  });

  const {
    register: registerPassword,
    handleSubmit: handleSubmitPassword,
    reset: resetPassword,
    formState: { errors: passwordErrors }
  } = useForm<PasswordFormData>({
    resolver: zodResolver(passwordSchema)
  });

  useEffect(() => {
    async function getProfile() {
      try {
        setLoading(true);
        if (!user) return;

        const { data, error } = await supabase
          .from('profiles')
          .select('name, phone, bio, avatar_url')
          .eq('id', user.id)
          .single();

        if (error && error.code !== 'PGRST116') {
          throw error;
        }

        if (data) {
          setValue('name', data.name);
          setValue('phone', data.phone);
          setValue('bio', data.bio);
          setAvatarUrl(data.avatar_url);
        } else {
            // Fallback to auth metadata if profile doesn't exist yet
            setValue('name', user.user_metadata?.name || '');
        }
      } catch (error) {
        console.error('Error loading profile:', error);
      } finally {
        setLoading(false);
      }
    }

    getProfile();
  }, [user, setValue]);

  const updateProfile = async (data: ProfileFormData) => {
    try {
      setSaving(true);
      if (!user) return;

      const updates = {
        id: user.id,
        name: data.name,
        phone: data.phone,
        bio: data.bio,
        avatar_url: avatarUrl,
        updated_at: new Date(),
      };

      const { error } = await supabase.from('profiles').upsert(updates);

      if (error) throw error;
      alert('Perfil atualizado com sucesso!');
    } catch (error) {
      alert('Erro ao atualizar perfil!');
      console.error(error);
    } finally {
      setSaving(false);
    }
  };

  const updatePassword = async (data: PasswordFormData) => {
    try {
      setChangingPassword(true);
      const { error } = await supabase.auth.updateUser({
        password: data.password
      });

      if (error) throw error;
      
      alert('Senha atualizada com sucesso!');
      resetPassword();
    } catch (error: any) {
      alert('Erro ao atualizar senha: ' + error.message);
    } finally {
      setChangingPassword(false);
    }
  };

  const uploadAvatar = async (event: React.ChangeEvent<HTMLInputElement>) => {
    try {
      setUploading(true);

      if (!event.target.files || event.target.files.length === 0) {
        throw new Error('Você deve selecionar uma imagem para upload.');
      }

      const file = event.target.files[0];
      const fileExt = file.name.split('.').pop();
      const fileName = `${user?.id}-${Math.random()}.${fileExt}`;
      const filePath = `${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file);

      if (uploadError) {
        throw uploadError;
      }

      const { data } = supabase.storage.from('avatars').getPublicUrl(filePath);
      setAvatarUrl(data.publicUrl);
      
    } catch (error) {
      alert('Erro ao fazer upload da imagem!');
      console.error(error);
    } finally {
      setUploading(false);
    }
  };

  if (loading) {
    return (
        <div className="flex justify-center items-center h-64">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Configurações do Perfil</h1>
        <p className="text-gray-500 mt-1">Gerencie suas informações pessoais e aparência.</p>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
        <form onSubmit={handleSubmit(updateProfile)} className="space-y-8">
          
          {/* Avatar Upload */}
          <div className="flex flex-col items-center space-y-4">
            <div className="relative group">
              <div className="h-32 w-32 rounded-full overflow-hidden bg-gray-100 border-4 border-white shadow-md">
                {avatarUrl ? (
                  <img
                    src={avatarUrl}
                    alt="Avatar"
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="h-full w-full flex items-center justify-center text-gray-400">
                    <Camera className="h-12 w-12" />
                  </div>
                )}
              </div>
              <label 
                htmlFor="avatar-upload" 
                className="absolute bottom-0 right-0 p-2 bg-primary text-white rounded-full shadow-lg cursor-pointer hover:bg-primary/90 transition-colors"
              >
                <Camera className="h-4 w-4" />
                <input
                  id="avatar-upload"
                  type="file"
                  accept="image/*"
                  onChange={uploadAvatar}
                  className="hidden"
                  disabled={uploading}
                />
              </label>
            </div>
            <p className="text-sm text-gray-500">
              {uploading ? 'Enviando...' : 'Clique na câmera para alterar sua foto'}
            </p>
          </div>

          <div className="space-y-4">
            <Input
              label="Nome Completo"
              error={errors.name?.message}
              {...register('name')}
            />

            <Input
              label="Telefone / WhatsApp"
              error={errors.phone?.message}
              {...register('phone')}
            />

            <div className="space-y-1">
              <label className="block text-sm font-medium text-gray-700">
                Bio / Sobre Mim
              </label>
              <textarea
                className="flex min-h-[100px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                placeholder="Conte um pouco sobre sua especialidade..."
                {...register('bio')}
              />
            </div>
          </div>

          <div className="flex justify-end pt-4 border-t border-gray-100">
            <Button type="submit" isLoading={saving} className="w-full sm:w-auto">
              <Save className="h-4 w-4 mr-2" />
              Salvar Alterações
            </Button>
          </div>
        </form>
      </div>

      {/* Password Change Section */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
        <h2 className="text-xl font-bold text-gray-900 mb-6">Alterar Senha</h2>
        <form onSubmit={handleSubmitPassword(updatePassword)} className="space-y-4">
          <Input
            type="password"
            label="Nova Senha"
            error={passwordErrors.password?.message}
            {...registerPassword('password')}
          />

          <Input
            type="password"
            label="Confirmar Nova Senha"
            error={passwordErrors.confirmPassword?.message}
            {...registerPassword('confirmPassword')}
          />

          <div className="flex justify-end pt-4 border-t border-gray-100">
            <Button type="submit" isLoading={changingPassword} variant="outline" className="w-full sm:w-auto">
              Atualizar Senha
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};
