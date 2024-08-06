import { Card, CardContent, CardHeader, Container } from "@mui/material"
import PaletteDetector from "./components/PaletteDetector"
import './index.css'

function App() {
  return (
    <Container>
      <Card variant="outlined">
        <CardHeader
          title="Pixel Art Palette Detector"
          subheader="Detect every single colour of a pixel art image"
        />
        <CardContent>
          <PaletteDetector/>
        </CardContent>
      </Card>
    </Container>
  )
}

export default App
