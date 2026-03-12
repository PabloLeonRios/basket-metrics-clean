'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import { toast } from 'react-toastify';

export default function CoachProfilePage() {
  const { user, isAuthenticated } = useAuth();
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user?.name) {
      setName(user.name);
    }
  }, [user]);

  if (!isAuthenticated) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password && password !== confirmPassword) {
      toast.error('Las contraseñas no coinciden.');
      return;
    }

    if (!user?._id) return;

    setLoading(true);
    try {
      const updateData: { name?: string; password?: string } = { name };
      if (password) updateData.password = password;

      const response = await fetch(`/api/users/${user._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updateData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Error al actualizar datos');
      }

      toast.success(
        'Datos actualizados correctamente. Recarga para ver los cambios.',
      );
      setPassword('');
      setConfirmPassword('');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Error desconocido');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-4 md:p-8 bg-white dark:bg-gray-800 rounded-lg shadow mt-6">
      <h1 className="text-2xl font-bold mb-6">Datos de Entrenador</h1>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Nombre y Apellido
          </label>
          <Input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            className="w-full"
          />
        </div>

        <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
          <h2 className="text-lg font-semibold mb-4">Cambio de Contraseña</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Nueva Contraseña
              </label>
              <Input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Dejar en blanco para no cambiar"
                className="w-full"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Confirmar Nueva Contraseña
              </label>
              <Input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full"
              />
            </div>
          </div>
        </div>

        <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
          <Button type="submit" disabled={loading} className="w-full md:w-auto">
            {loading ? 'Guardando...' : 'Guardar Cambios'}
          </Button>
        </div>
      </form>
    </div>
  );
}
