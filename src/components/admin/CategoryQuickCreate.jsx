import { useState } from 'react';
import { Button, Form, InputGroup } from 'react-bootstrap';
import { createCategory } from '../../services/categoryService';
import { useToast } from '../../context/ToastContext';

// Pequeño formulario para crear una categoría sin salir del modal de producto
export default function CategoryQuickCreate({ onCreated }) {
  const { showToast } = useToast();
  const [name, setName] = useState('');
  const [saving, setSaving] = useState(false);

  const handleCreate = async () => {
    if (!name.trim()) return;
    setSaving(true);
    try {
      const category = await createCategory(name.trim());
      showToast(`Categoría "${category.name}" creada`, { variant: 'success' });
      setName('');
      onCreated(category);
    } catch (err) {
      showToast(err.message, { variant: 'danger' });
    } finally {
      setSaving(false);
    }
  };

  return (
    <InputGroup size="sm" className="mt-2">
      <Form.Control
        placeholder="Nueva categoría"
        aria-label="Nombre de la nueva categoría"
        value={name}
        onChange={(e) => setName(e.target.value)}
        // Enter crea la categoría (y no envía el formulario del producto)
        onKeyDown={(e) => {
          if (e.key === 'Enter') {
            e.preventDefault();
            handleCreate();
          }
        }}
      />
      <Button variant="outline-secondary" onClick={handleCreate} disabled={saving || !name.trim()}>
        {saving ? 'Creando...' : 'Crear'}
      </Button>
    </InputGroup>
  );
}
