import React, { useEffect, useState } from 'react';
import { coursesApi, Course } from '../services/courses.api';
import Layout from '../components/Layout';

const formatPrice = (value: number) =>
  `R$ ${value.toFixed(2).replace('.', ',')}`;

export default function Courses() {
  const [items, setItems] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    coursesApi
      .list()
      .then(setItems)
      .catch(() => setError('Não foi possível carregar os cursos.'))
      .finally(() => setLoading(false));
  }, []);

  return (
    <Layout title="Cursos" subtitle="Explore os cursos disponíveis.">
      {loading ? (
        <p className="muted">Carregando…</p>
      ) : (
        <>
          {error && <div className="error">{error}</div>}

          {items.length === 0 ? (
            <p className="muted small">Nenhum curso disponível.</p>
          ) : (
            <div className="card-grid">
              {items.map((course) => (
                <section key={course.id} className="card">
                  <h3 style={{ margin: 0 }}>{course.title}</h3>

                  <p className="muted" style={{ marginTop: 8 }}>
                    {course.description ?? 'Sem descrição.'}
                  </p>

                  <span className="muted small">
                    {formatPrice(course.price)} • Instrutor: {course.instructorId}
                  </span>
                </section>
              ))}
            </div>
          )}
        </>
      )}
    </Layout>
  );
}
