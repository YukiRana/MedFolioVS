const AppState = {
  practiceRecords: [],
  events: [],
  selectedHospital: '',
  currentDate: '',
  entryMode: '',
  individualPatients: [],
  selectedCategory: '',
  currentFilter: 'all',

  save() {
    localStorage.setItem('mf_records', JSON.stringify(this.practiceRecords));
    localStorage.setItem('mf_events', JSON.stringify(this.events));
  },

  load() {
    try {
      this.practiceRecords = JSON.parse(localStorage.getItem('mf_records') || '[]');
      const eventsRaw = localStorage.getItem('mf_events');
      if(!eventsRaw){
        const defaultEvents = [
          { title:'Undergraduate Surgery Lecture — PGIM', category:'Teaching Activities', date:'2026-03-10', venue:'PGIM, Colombo', role:'Lecturer', type:'teaching' },
          { title:'TAMIS for Rectal Neoplasms: A Case Series', category:'Research & Publications', date:'2025-09-15', venue:'Journal of Minimal Access Surgery', role:'Author', type:'research' },
          { title:'Best Oral Presentation — CSSL 2025', category:'Awards & Recognition', date:'2025-11-14', venue:'Sri Lanka College of Surgeons', role:'Presenter', type:'events' },
          { title:'Final MBBS Clinical Examiner', category:'Examiner Roles', date:'2025-07-20', venue:'University of Colombo', role:'Examiner', type:'events' },
          { title:'AI-Assisted Surgical Documentation Tool', category:'Innovation & AI', date:'2026-01-05', venue:'NHSL Colombo', role:'Developer', type:'events' },
        ];
        this.events = defaultEvents;
        this.save();
      } else {
        this.events = JSON.parse(eventsRaw || '[]');
      }
    } catch(e){
      this.practiceRecords = [];
      this.events = [];
    }
  }
};
