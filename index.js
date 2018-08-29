const express = require('express');
const answers = require('./routes/answers');

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/api/answers', answers);

const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`Listening to port ${port}`));
