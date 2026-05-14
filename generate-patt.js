/**
 * AR.js .patt 파일 생성 스크립트
 * 마커 이미지(PNG)를 읽어서 AR.js가 인식할 수 있는 .patt 파일을 생성합니다.
 *
 * 사용법: node generate-patt.js <input.png> <output.patt>
 *
 * .patt 형식:
 * - 4개 회전(0°, 90°, 180°, 270°) × 3채널(R, G, B)
 * - 각 채널: 16×16 그리드 (patternRatio=0.5이면 중앙 50% 영역만 샘플링)
 * - 빈 줄로 회전 구분
 */

const fs = require('fs')

// PNG 디코딩을 위한 최소 구현 (외부 라이브러리 없이)
// sharp나 canvas가 없으므로 직접 PNG를 파싱합니다
const zlib = require('zlib')

function parsePNG(buffer) {
  // PNG signature 확인
  const sig = buffer.slice(0, 8)
  if (sig.toString('hex') !== '89504e470d0a1a0a') {
    throw new Error('Not a PNG file')
  }

  let offset = 8
  let width, height, bitDepth, colorType
  let idatBuffers = []

  while (offset < buffer.length) {
    const length = buffer.readUInt32BE(offset)
    const type = buffer.slice(offset + 4, offset + 8).toString('ascii')
    const data = buffer.slice(offset + 8, offset + 8 + length)

    if (type === 'IHDR') {
      width = data.readUInt32BE(0)
      height = data.readUInt32BE(4)
      bitDepth = data[8]
      colorType = data[9]
    } else if (type === 'IDAT') {
      idatBuffers.push(data)
    } else if (type === 'IEND') {
      break
    }

    offset += 12 + length
  }

  // IDAT 데이터 합치고 decompress
  const compressed = Buffer.concat(idatBuffers)
  const decompressed = zlib.inflateSync(compressed)

  // 픽셀 데이터 추출 (filter 바이트 제거)
  const channels = colorType === 6 ? 4 : colorType === 2 ? 3 : colorType === 4 ? 2 : 1
  const bytesPerPixel = channels * (bitDepth / 8)
  const stride = width * bytesPerPixel + 1 // +1 for filter byte

  const pixels = new Uint8Array(width * height * 4) // RGBA output

  // 이전 행 (Paeth/Up 필터용)
  let prevRow = new Uint8Array(width * bytesPerPixel)
  
  for (let y = 0; y < height; y++) {
    const rowStart = y * stride
    const filterType = decompressed[rowStart]
    const rawRow = new Uint8Array(width * bytesPerPixel)

    for (let i = 0; i < width * bytesPerPixel; i++) {
      const raw = decompressed[rowStart + 1 + i]
      let val = raw

      switch (filterType) {
        case 0: // None
          val = raw
          break
        case 1: // Sub
          val = raw + (i >= bytesPerPixel ? rawRow[i - bytesPerPixel] : 0)
          break
        case 2: // Up
          val = raw + prevRow[i]
          break
        case 3: // Average
          const a = i >= bytesPerPixel ? rawRow[i - bytesPerPixel] : 0
          val = raw + Math.floor((a + prevRow[i]) / 2)
          break
        case 4: // Paeth
          const pa = i >= bytesPerPixel ? rawRow[i - bytesPerPixel] : 0
          const pb = prevRow[i]
          const pc = i >= bytesPerPixel ? prevRow[i - bytesPerPixel] : 0
          val = raw + paeth(pa, pb, pc)
          break
      }

      rawRow[i] = val & 0xFF
    }

    // rawRow를 RGBA로 변환
    for (let x = 0; x < width; x++) {
      const pixelIdx = (y * width + x) * 4
      if (channels === 4) { // RGBA
        pixels[pixelIdx] = rawRow[x * 4]
        pixels[pixelIdx + 1] = rawRow[x * 4 + 1]
        pixels[pixelIdx + 2] = rawRow[x * 4 + 2]
        pixels[pixelIdx + 3] = rawRow[x * 4 + 3]
      } else if (channels === 3) { // RGB
        pixels[pixelIdx] = rawRow[x * 3]
        pixels[pixelIdx + 1] = rawRow[x * 3 + 1]
        pixels[pixelIdx + 2] = rawRow[x * 3 + 2]
        pixels[pixelIdx + 3] = 255
      } else if (channels === 1) { // Grayscale
        pixels[pixelIdx] = rawRow[x]
        pixels[pixelIdx + 1] = rawRow[x]
        pixels[pixelIdx + 2] = rawRow[x]
        pixels[pixelIdx + 3] = 255
      } else if (channels === 2) { // Grayscale + Alpha
        pixels[pixelIdx] = rawRow[x * 2]
        pixels[pixelIdx + 1] = rawRow[x * 2]
        pixels[pixelIdx + 2] = rawRow[x * 2]
        pixels[pixelIdx + 3] = rawRow[x * 2 + 1]
      }
    }

    prevRow = rawRow.slice()
  }

  return { width, height, pixels }
}

function paeth(a, b, c) {
  const p = a + b - c
  const pa = Math.abs(p - a)
  const pb = Math.abs(p - b)
  const pc = Math.abs(p - c)
  if (pa <= pb && pa <= pc) return a
  if (pb <= pc) return b
  return c
}

function getPixel(pixels, width, x, y) {
  const idx = (y * width + x) * 4
  return {
    r: pixels[idx],
    g: pixels[idx + 1],
    b: pixels[idx + 2],
  }
}

// 이미지의 특정 영역을 16x16으로 샘플링
function sampleRegion(pixels, width, height, patternSize, patternRatio) {
  // patternRatio=0.5: 중앙 50%만 패턴으로 사용 (나머지는 검정 테두리)
  const borderPercent = (1 - patternRatio) / 2
  const x0 = Math.floor(width * borderPercent)
  const y0 = Math.floor(height * borderPercent)
  const innerW = Math.floor(width * patternRatio)
  const innerH = Math.floor(height * patternRatio)

  const grid = []
  for (let py = 0; py < patternSize; py++) {
    const row = []
    for (let px = 0; px < patternSize; px++) {
      // 해당 그리드 셀의 평균 색상 계산
      const sx = x0 + Math.floor((px / patternSize) * innerW)
      const sy = y0 + Math.floor((py / patternSize) * innerH)
      const ex = x0 + Math.floor(((px + 1) / patternSize) * innerW)
      const ey = y0 + Math.floor(((py + 1) / patternSize) * innerH)

      let rSum = 0, gSum = 0, bSum = 0, count = 0
      for (let iy = sy; iy < ey; iy++) {
        for (let ix = sx; ix < ex; ix++) {
          const p = getPixel(pixels, width, ix, iy)
          rSum += p.r
          gSum += p.g
          bSum += p.b
          count++
        }
      }

      row.push({
        r: count > 0 ? Math.round(rSum / count) : 0,
        g: count > 0 ? Math.round(gSum / count) : 0,
        b: count > 0 ? Math.round(bSum / count) : 0,
      })
    }
    grid.push(row)
  }

  return grid
}

// 그리드를 시계 방향 90도 회전
function rotateGrid90(grid) {
  const size = grid.length
  const rotated = []
  for (let y = 0; y < size; y++) {
    const row = []
    for (let x = 0; x < size; x++) {
      row.push(grid[size - 1 - x][y])
    }
    rotated.push(row)
  }
  return rotated
}

// .patt 파일 내용 생성
function generatePatt(grid) {
  const lines = []
  let currentGrid = grid

  for (let rotation = 0; rotation < 4; rotation++) {
    // R 채널
    for (let y = 0; y < currentGrid.length; y++) {
      const vals = currentGrid[y].map(p => String(p.r).padStart(4, ' ')).join('')
      lines.push(vals)
    }
    // G 채널
    for (let y = 0; y < currentGrid.length; y++) {
      const vals = currentGrid[y].map(p => String(p.g).padStart(4, ' ')).join('')
      lines.push(vals)
    }
    // B 채널
    for (let y = 0; y < currentGrid.length; y++) {
      const vals = currentGrid[y].map(p => String(p.b).padStart(4, ' ')).join('')
      lines.push(vals)
    }
    lines.push('') // 빈 줄로 회전 구분

    currentGrid = rotateGrid90(currentGrid)
  }

  return lines.join('\n')
}

// 메인
const args = process.argv.slice(2)
if (args.length < 2) {
  console.log('Usage: node generate-patt.js <input.png> <output.patt>')
  console.log('Example: node generate-patt.js public/markers/pull-up-marker.png public/markers/pull-up.patt')
  process.exit(1)
}

const inputPath = args[0]
const outputPath = args[1]
const PATTERN_SIZE = 16
const PATTERN_RATIO = 0.5

console.log(`Reading: ${inputPath}`)
const buf = fs.readFileSync(inputPath)
const img = parsePNG(buf)
console.log(`Image size: ${img.width}x${img.height}`)

const grid = sampleRegion(img.pixels, img.width, img.height, PATTERN_SIZE, PATTERN_RATIO)
const patt = generatePatt(grid)

fs.writeFileSync(outputPath, patt)
console.log(`Generated: ${outputPath}`)
