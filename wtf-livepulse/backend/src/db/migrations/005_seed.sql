-- Intentionally lightweight.
-- Full seed generation runs from backend startup via src/db/seeds/seed.js
INSERT INTO gyms (name, city, capacity, opens_at, closes_at)
SELECT * FROM (
  VALUES
  ('WTF Gyms — Lajpat Nagar','New Delhi',220,'05:30','22:30'),
  ('WTF Gyms — Connaught Place','New Delhi',180,'06:00','22:00'),
  ('WTF Gyms — Bandra West','Mumbai',300,'05:00','23:00'),
  ('WTF Gyms — Powai','Mumbai',250,'05:30','22:30'),
  ('WTF Gyms — Indiranagar','Bengaluru',200,'05:30','22:00'),
  ('WTF Gyms — Koramangala','Bengaluru',180,'06:00','22:00'),
  ('WTF Gyms — Banjara Hills','Hyderabad',160,'06:00','22:00'),
  ('WTF Gyms — Sector 18 Noida','Noida',140,'06:00','21:30'),
  ('WTF Gyms — Salt Lake','Kolkata',120,'06:00','21:00'),
  ('WTF Gyms — Velachery','Chennai',110,'06:00','21:00')
) AS seed(name, city, capacity, opens_at, closes_at)
WHERE NOT EXISTS (SELECT 1 FROM gyms);
