import { useState } from 'react';
import { PLACEHOLDER_IMAGE } from '../utils/labels';

// Imagen grande + miniaturas clickeables
export default function ImageGallery({ images = [], title }) {
  const [selected, setSelected] = useState(0);

  if (images.length === 0) {
    return <img src={PLACEHOLDER_IMAGE} alt={title} className="img-fluid rounded w-100" />;
  }

  const current = images[selected] || images[0];

  return (
    <div>
      <img
        src={current.url}
        alt={title}
        className="img-fluid rounded w-100 bg-light"
        style={{ maxHeight: 560, objectFit: 'contain' }}
      />
      {images.length > 1 && (
        <div className="d-flex flex-wrap gap-2 mt-2">
          {images.map((img, index) => (
            <button
              key={img.id}
              type="button"
              onClick={() => setSelected(index)}
              className={`p-0 border rounded overflow-hidden ${index === selected ? 'border-primary border-2' : ''}`}
              style={{ width: 72, height: 72, background: 'none' }}
              aria-label={`Ver foto ${index + 1}`}
            >
              <img
                src={img.thumbnailUrl || img.url}
                alt=""
                loading="lazy"
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
