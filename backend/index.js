import express, { json } from 'express'
import cors from 'cors'
import multer from 'multer'
import csvToJson from 'convert-csv-to-json'

const app = express()
const port = process.env.PORT ?? 3000

const storage = multer.memoryStorage()
const upload = multer({ storage: storage })

app.use(cors())

let userData = []

app.post('/api/files', upload.single('file'), async(req, res) => {
  const { file } = req
  if (!file) return res.status(500).json({ message: 'File is required' })

  if (file.mimetype !== 'text/csv') return res.status(500).json({ message: 'File must be CSV' })

  try {
    const csv = Buffer.from(file.buffer).toString('utf-8')
    const json = csvToJson.fieldDelimiter(',').csvStringToJson(csv)
    userData = json

  } catch (error) {
    return res.status(500).json({ message: 'An error ocurred while upload the csv' })
  }

  return res.status(200).json({ data: userData ,message: 'File uploaded successfully'})
})

app.get('/api/users', async (req, res) => {
  const { q } = req.query

  if (!q) return res.status(500).json({ message: 'The query param q is required'})

  if (Array.isArray(q)) {
    return res.status(500).json({ message: 'Query param q must be a string'})
  }

  const search = q.toLowerCase()

  const valuesFilter = userData.filter(row => {
    return Object.values(row).some(value => value.toLowerCase().includes(search))
  })

  return res.status(200).json({ data: valuesFilter })
})

app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`)
})