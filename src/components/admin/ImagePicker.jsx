import { useEffect, useState } from 'react';
import { Form, Alert, CloseButton } from 'react-bootstrap';

const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/avif'];
const MAX_SIZE_MB = 15;

// Selector de imágenes nuevas con vista previa y validación en el navegador.
// files: archivos elegidos (los guarda el componente padre), maxFiles: cuántos se pueden agregar
export default function ImagePicker({ files, onChange, maxFiles }) {
  const [previews, setPreviews] = useState([]);
  const [errors, setErrors] = useState([]);

  // Creamos URLs temporales para ver las fotos y las liberamos al cambiar la lista
  useEffect(() => {
    const urls = files.map((file) => URL.createObjectURL(file));
    setPreviews(urls);
    return () => urls.forEach((url) => URL.revokeObjectURL(url));
  }, [files]);

  const handleSelect = (e) => {
    const selected = Array.from(e.target.files);
    e.target.value = ''; // permite volver a elegir el mismo archivo
    const newErrors = [];
    const valid = [];

    selected.forEach((file) => {
      if (!ALLOWED_TYPES.includes(file.type)) {
        newErrors.push(`"${file.name}": formato no permitido (usá JPG, PNG, WEBP o AVIF).`);
      } else if (file.size > MAX_SIZE_MB * 1024 * 1024) {
        newErrors.push(`"${file.name}": pesa más de ${MAX_SIZE_MB} MB.`);
      } else {
        valid.push(file);
      }
    });

    const espacio = maxFiles - files.length;
    if (valid.length > espacio) {
      newErrors.push(`Solo podés agregar ${Math.max(espacio, 0)} imagen(es) más.`);
      valid.splice(Math.max(espacio, 0));
    }

    setErrors(newErrors);
    if (valid.length > 0) onChange([...files, ...valid]);
  };

  const removeFile = (index) => onChange(files.filter((_, i) => i !== index));

  return (
    <Form.Group className="mb-3" controlId="productoImagenes">
      <Form.Label>Agregar fotos</Form.Label>
      <Form.Control
        type="file"
        multiple
        accept="image/jpeg,image/png,image/webp,image/avif"
        onChange={handleSelect}
        disabled={maxFiles - files.length <= 0}
      />
      <Form.Text>JPG, PNG, WEBP o AVIF. Máximo {MAX_SIZE_MB} MB cada una.</Form.Text>

      {errors.length > 0 && (
        <Alert variant="warning" className="mt-2 mb-0 small">
          {errors.map((err) => <div key={err}>{err}</div>)}
        </Alert>
      )}

      {previews.length > 0 && (
        <div className="d-flex flex-wrap gap-2 mt-2">
          {previews.map((url, index) => (
            <div key={url} className="position-relative">
              <img src={url} alt={files[index]?.name} className="rounded border" style={{ width: 80, height: 80, objectFit: 'cover' }} />
              <CloseButton
                className="position-absolute top-0 end-0 bg-white"
                aria-label="Quitar foto"
                onClick={() => removeFile(index)}
              />
            </div>
          ))}
        </div>
      )}
    </Form.Group>
  );
}
