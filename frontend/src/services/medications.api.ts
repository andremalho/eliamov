import api from './api';

export type MedicationCategory = 'hormonal_contraceptive' | 'hormonal_iud' | 'thyroid' | 'antidepressant' | 'anxiolytic' | 'progesterone' | 'other';

export type Medication = {
  id: string; userId: string; name: string; category: MedicationCategory;
  dose: string | null; frequency: string | null; startDate: string;
  endDate: string | null; active: boolean; notes: string | null;
  createdAt: string; updatedAt: string;
};

export type CreateMedicationInput = {
  name: string; category: MedicationCategory; dose?: string;
  frequency?: string; startDate: string; notes?: string;
};

export type UpdateMedicationInput = Partial<{
  name: string; dose: string; frequency: string;
  endDate: string; active: boolean; notes: string;
}>;

export const categoryLabels: Record<MedicationCategory, string> = {
  hormonal_contraceptive: 'Anticoncepcional hormonal',
  hormonal_iud: 'DIU hormonal',
  thyroid: 'Hormonio tireoidiano',
  antidepressant: 'Antidepressivo / ISRS',
  anxiolytic: 'Ansiolitico',
  progesterone: 'Progesterona',
  other: 'Outro',
};

export const categoryExamples: Record<MedicationCategory, string> = {
  hormonal_contraceptive: 'ex: Yasmin, Diane, Nuvaring, adesivo',
  hormonal_iud: 'ex: Mirena, Kyleena',
  thyroid: 'ex: Levotiroxina, Euthyrox',
  antidepressant: 'ex: Sertralina, Fluoxetina, Escitalopram',
  anxiolytic: 'ex: Clonazepam, Buspirona, Alprazolam',
  progesterone: 'ex: Utrogestan, Crinone, Duphaston',
  other: 'Informe o nome do medicamento',
};

export const medicationsApi = {
  list: (includeInactive = false): Promise<Medication[]> =>
    api.get(`/medications${includeInactive ? '?includeInactive=true' : ''}`).then(r => r.data),
  create: (data: CreateMedicationInput): Promise<Medication> =>
    api.post('/medications', data).then(r => r.data),
  update: (id: string, data: UpdateMedicationInput): Promise<Medication> =>
    api.patch(`/medications/${id}`, data).then(r => r.data),
  discontinue: (id: string): Promise<Medication> =>
    api.patch(`/medications/${id}/discontinue`).then(r => r.data),
};
