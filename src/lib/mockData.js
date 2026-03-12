export const INITIAL_PATIENTS = [
  {
    id: '32203-1234567-1',
    name: 'Ayesha Bibi',
    phone: '0300-1234567',
    area: 'Ward 5, Layyah',
    caste: 'Rajput',
    reference: 'LHV',
    assignedTo: 'Nurse Fatima',
    edd: '2026-03-25',
    intent: 'High',
    preference: 'Clinic',
    status: 'Active',
    registrationDate: '2026-02-15T10:15:00Z',
    lastContact: '2026-03-05T14:30:00Z',
    interactions: [
      { id: 1, date: '2026-03-05T14:30:00Z', type: 'Call', staff: 'Nurse Fatima', notes: 'Patient confirmed she is taking supplements. Very interested in delivering at the clinic due to the new facilities.', intent: 'High', preference: 'Clinic' },
      { id: 2, date: '2026-02-15T10:15:00Z', type: 'Visit', staff: 'Dr. Sarah', notes: 'Routine 8th-month checkup. Everything normal.', intent: 'Medium', preference: 'Undecided' }
    ]
  },
  {
    id: '32203-9876543-2',
    name: 'Shazia Hussain',
    phone: '0333-9876543',
    area: 'Chowk Azam Road',
    caste: 'Jat',
    reference: 'Midwife',
    assignedTo: 'LHV Ayesha',
    edd: '2026-04-10',
    intent: 'Medium',
    preference: 'Home',
    status: 'Active',
    registrationDate: '2026-02-28T09:00:00Z',
    lastContact: '2026-02-28T09:00:00Z',
    interactions: [
      { id: 1, date: '2026-02-28T09:00:00Z', type: 'Visit', staff: 'LHV Ayesha', notes: 'Mother-in-law wants home delivery. Needs more counseling on clinic benefits.', intent: 'Medium', preference: 'Home' }
    ]
  },
  {
    id: '32203-1122334-3',
    name: 'Zainab Tariq',
    phone: '0345-1122334',
    area: 'Ward 8, Layyah',
    caste: 'Arain',
    reference: 'Self',
    assignedTo: 'Dr. Sarah',
    edd: '2026-03-12',
    intent: 'Low',
    preference: 'Other Hospital',
    status: 'Active',
    registrationDate: '2026-01-10T11:45:00Z',
    lastContact: '2026-01-10T11:45:00Z',
    interactions: [
      { id: 1, date: '2026-01-10T11:45:00Z', type: 'Visit', staff: 'Dr. Sarah', notes: 'Mentioned moving to Multan for delivery at her parents house. Keep following up just in case.', intent: 'Low', preference: 'Other Hospital' }
    ]
  },
  {
    id: '32203-5566778-4',
    name: 'Khadija Rehman',
    phone: '0301-5566778',
    area: 'Housing Colony',
    caste: 'Syed',
    reference: 'Doctor',
    assignedTo: 'Nurse Fatima',
    edd: '2026-02-10',
    intent: 'High',
    preference: 'Clinic',
    status: 'Delivered (Clinic)',
    registrationDate: '2026-02-05T16:20:00Z',
    lastContact: '2026-02-12T08:00:00Z',
    interactions: [
      { id: 2, date: '2026-02-12T08:00:00Z', type: 'Outcome Logged', staff: 'Dr. Sarah', notes: 'Patient delivered a healthy baby boy at the clinic. Case closed successfully.', intent: 'High', preference: 'Clinic' },
      { id: 1, date: '2026-02-05T16:20:00Z', type: 'Visit', staff: 'Dr. Sarah', notes: 'Routine checkup. Ready for delivery.', intent: 'High', preference: 'Clinic' }
    ]
  },
  {
    id: '32203-9988776-5',
    name: 'Rabia Saeed',
    phone: '0321-9988776',
    area: 'Ward 5, Layyah',
    caste: 'Bhatti',
    reference: 'Staff',
    assignedTo: 'LHV Ayesha',
    edd: '2026-03-18',
    intent: 'Medium',
    preference: 'Undecided',
    status: 'Active',
    registrationDate: '2026-02-01T13:10:00Z',
    lastContact: '2026-02-01T13:10:00Z',
    interactions: [
      { id: 1, date: '2026-02-01T13:10:00Z', type: 'Call', staff: 'Nurse Fatima', notes: 'Missed her last appointment. Needs an urgent follow-up call.', intent: 'Medium', preference: 'Undecided' }
    ]
  }
];