'use client'

import { useState } from 'react'
import { useSupabase } from '@/components/providers/supabase-provider'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { toast } from 'sonner'

export default function SupabaseTest() {
  const { supabase } = useSupabase()
  const [testData, setTestData] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const handleInsert = async () => {
    if (!supabase) return
    setIsLoading(true)
    try {
      const { data, error } = await supabase
        .from('test_table')
        .insert([{ test_column: testData }])
        .select()

      if (error) throw error

      toast.success('Dato insertado correctamente')
      console.log('Datos insertados:', data)
    } catch (error) {
      console.error('Error al insertar:', error)
      toast.error('Error al insertar datos')
    } finally {
      setIsLoading(false)
    }
  }

  const handleSelect = async () => {
    if (!supabase) return
    setIsLoading(true)
    try {
      const { data, error } = await supabase
        .from('test_table')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error

      toast.success('Datos obtenidos correctamente')
      console.log('Datos obtenidos:', data)
    } catch (error) {
      console.error('Error al obtener datos:', error)
      toast.error('Error al obtener datos')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="space-y-4 p-4 border rounded-lg">
      <h2 className="text-lg font-semibold">Prueba de Supabase</h2>
      <div className="flex gap-2">
        <Input
          placeholder="Ingresa un dato de prueba"
          value={testData}
          onChange={(e) => setTestData(e.target.value)}
        />
        <Button onClick={handleInsert} disabled={isLoading}>
          Insertar
        </Button>
        <Button onClick={handleSelect} disabled={isLoading}>
          Consultar
        </Button>
      </div>
    </div>
  )
} 