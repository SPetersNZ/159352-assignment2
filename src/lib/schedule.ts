// Airport info
export const AIRPORTS: Record<string, { name: string; tz: string }> = {
  NZNE: { name: 'Dairy Flat Airport', tz: 'Pacific/Auckland' },
  YSSY: { name: 'Sydney Airport', tz: 'Australia/Sydney' },
  NZRO: { name: 'Rotorua Airport', tz: 'Pacific/Auckland' },
  NZGB: { name: 'Claris Airport (Great Barrier Island)', tz: 'Pacific/Auckland' },
  NZCI: { name: 'Tuuta Airport (Chatham Islands)', tz: 'Pacific/Chatham' },
  NZTL: { name: 'Lake Tekapo Airport', tz: 'Pacific/Auckland' },
}

// Aircraft and how many seats each has
export const AIRCRAFT: Record<string, { name: string; seats: number }> = {
  SJ30I:  { name: 'SyberJet SJ30i', seats: 6 },
  'SF50-A': { name: 'Cirrus SF50', seats: 4 },
  'SF50-B': { name: 'Cirrus SF50', seats: 4 },
  'HJE-A':  { name: 'HondaJet Elite', seats: 5 },
  'HJE-B':  { name: 'HondaJet Elite', seats: 5 },
}

// The weekly timetable. daysOfWeek: 0=Sun, 1=Mon, ... 6=Sat
// departureTime is the local time at the origin airport
export const TIMETABLE = [
  // Sydney prestige service
  { flightNo: 'DF101', origin: 'NZNE', dest: 'YSSY', aircraft: 'SJ30I',   days: [5],          depTime: '10:30', durationMins: 210, price: 2800 },
  { flightNo: 'DF102', origin: 'YSSY', dest: 'NZNE', aircraft: 'SJ30I',   days: [0],          depTime: '14:30', durationMins: 180, price: 2800 },

  // Rotorua shuttle (twice daily Mon-Fri)
  { flightNo: 'DF201', origin: 'NZNE', dest: 'NZRO', aircraft: 'SF50-A',  days: [1,2,3,4,5], depTime: '06:30', durationMins: 45,  price: 280  },
  { flightNo: 'DF202', origin: 'NZRO', dest: 'NZNE', aircraft: 'SF50-A',  days: [1,2,3,4,5], depTime: '07:30', durationMins: 45,  price: 280  },
  { flightNo: 'DF203', origin: 'NZNE', dest: 'NZRO', aircraft: 'SF50-A',  days: [1,2,3,4,5], depTime: '16:30', durationMins: 45,  price: 280  },
  { flightNo: 'DF204', origin: 'NZRO', dest: 'NZNE', aircraft: 'SF50-A',  days: [1,2,3,4,5], depTime: '18:00', durationMins: 45,  price: 280  },

  // Great Barrier Island 3x weekly
  { flightNo: 'DF301', origin: 'NZNE', dest: 'NZGB', aircraft: 'SF50-B',  days: [1,3,5],     depTime: '09:00', durationMins: 35,  price: 220  },
  { flightNo: 'DF302', origin: 'NZGB', dest: 'NZNE', aircraft: 'SF50-B',  days: [2,4,6],     depTime: '09:00', durationMins: 35,  price: 220  },

  // Chatham Islands twice weekly
  { flightNo: 'DF401', origin: 'NZNE', dest: 'NZCI', aircraft: 'HJE-A',   days: [2,5],       depTime: '08:00', durationMins: 135, price: 950  },
  { flightNo: 'DF402', origin: 'NZCI', dest: 'NZNE', aircraft: 'HJE-A',   days: [3,6],       depTime: '10:00', durationMins: 150, price: 950  },

  // Lake Tekapo weekly
  { flightNo: 'DF501', origin: 'NZNE', dest: 'NZTL', aircraft: 'HJE-B',   days: [1],         depTime: '10:00', durationMins: 130, price: 680  },
  { flightNo: 'DF502', origin: 'NZTL', dest: 'NZNE', aircraft: 'HJE-B',   days: [2],         depTime: '10:00', durationMins: 120, price: 680  },
]
