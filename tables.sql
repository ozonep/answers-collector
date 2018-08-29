DROP TABLE IF EXISTS student_answers;
DROP TABLE IF EXISTS answers;

CREATE TABLE student_answers (
  answer_id TEXT PRIMARY KEY,
  user_id TEXT,
  answer TEXT,
  date TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE answers (
  id TEXT REFERENCES student_answers (answer_id),
  normalized_answer TEXT NOT NULL,
  hash TEXT NOT NULL,
  exercise_id TEXT
);


insert into student_answers (answer_id, user_id, answer) values
                                                                ('fgfdggdfgdfg', 'xfdfsdffds', 'answer1'),
                                                                ('dxfdfdfdfd', 'dfgdffgdg', 'answer2')