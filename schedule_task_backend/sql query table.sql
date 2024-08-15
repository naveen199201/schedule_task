CREATE TABLE mentor_availability (
    id UUID PRIMARY KEY,
    mentor_id UUID REFERENCES mentors(id),
    available_date DATE,
    start_time TIME,
    end_time TIME,
    available BOOLEAN DEFAULT true
);

-- Adjust the schedules table to include the date
CREATE TABLE schedules (
    id UUID PRIMARY KEY,
    student_id UUID,
    mentor_id UUID,
    schedule_date DATE,
    start_time TIME,
    end_time TIME,
    price INTEGER
);
