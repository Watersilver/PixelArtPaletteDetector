import { Box, Card, CardContent, Grid, Input, Slider, Stack, Tooltip, Typography } from "@mui/material";
import { useEffect, useMemo, useRef, useState } from "react"
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import AddIcon from '@mui/icons-material/Add';

// https://stackoverflow.com/a/52453462

/**
 * delta E:
 * < 1: not perceptible by humans
 * 1-2: perceptible through close observation
 * 2-10: perceptible at a glance
 * 11-49: more similar than opposite
 * 100: complete opposite
 * 
 * @returns delta E that determines how different the two colors are
 */
function deltaE(rgbA: [number,number,number], rgbB: [number,number,number]) {
  let labA = rgb2lab(rgbA);
  let labB = rgb2lab(rgbB);
  let deltaL = labA[0] - labB[0];
  let deltaA = labA[1] - labB[1];
  let deltaB = labA[2] - labB[2];
  let c1 = Math.sqrt(labA[1] * labA[1] + labA[2] * labA[2]);
  let c2 = Math.sqrt(labB[1] * labB[1] + labB[2] * labB[2]);
  let deltaC = c1 - c2;
  let deltaH = deltaA * deltaA + deltaB * deltaB - deltaC * deltaC;
  deltaH = deltaH < 0 ? 0 : Math.sqrt(deltaH);
  let sc = 1.0 + 0.045 * c1;
  let sh = 1.0 + 0.015 * c1;
  let deltaLKlsl = deltaL / (1.0);
  let deltaCkcsc = deltaC / (sc);
  let deltaHkhsh = deltaH / (sh);
  let i = deltaLKlsl * deltaLKlsl + deltaCkcsc * deltaCkcsc + deltaHkhsh * deltaHkhsh;
  return i < 0 ? 0 : Math.sqrt(i);
}

function rgb2lab(rgb: [number,number,number]): [number,number,number] {
  let r = rgb[0] / 255, g = rgb[1] / 255, b = rgb[2] / 255, x, y, z;
  r = (r > 0.04045) ? Math.pow((r + 0.055) / 1.055, 2.4) : r / 12.92;
  g = (g > 0.04045) ? Math.pow((g + 0.055) / 1.055, 2.4) : g / 12.92;
  b = (b > 0.04045) ? Math.pow((b + 0.055) / 1.055, 2.4) : b / 12.92;
  x = (r * 0.4124 + g * 0.3576 + b * 0.1805) / 0.95047;
  y = (r * 0.2126 + g * 0.7152 + b * 0.0722) / 1.00000;
  z = (r * 0.0193 + g * 0.1192 + b * 0.9505) / 1.08883;
  x = (x > 0.008856) ? Math.pow(x, 1/3) : (7.787 * x) + 16/116;
  y = (y > 0.008856) ? Math.pow(y, 1/3) : (7.787 * y) + 16/116;
  z = (z > 0.008856) ? Math.pow(z, 1/3) : (7.787 * z) + 16/116;
  return [(116 * y) - 16, 500 * (x - y), 200 * (y - z)]
}

function rgbaToHex(r: number, g: number, b: number, a: number) {
  var outParts = [
    r.toString(16),
    g.toString(16),
    b.toString(16),
    Math.round(a * 255).toString(16).substring(0, 2)
  ];

  // Pad single-digit output values
  outParts.forEach((part, i) => outParts[i] = part.padStart(2, '0'));

  return ('#' + outParts.join(''));
}

// function hexToRgb(hex: string): [number,number,number] {
//   var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
//   if (!result) throw Error("Bad Hex");
//   return [
//     parseInt(result[1], 16),
//     parseInt(result[2], 16),
//     parseInt(result[3], 16)
//   ];
// }

function rgb2hsv(r: number, g: number, b: number): [h: number, s: number, v: number] {
  let
  rabs: number,
  gabs: number,
  babs: number,
  rr: number,
  gg: number,
  bb: number,
  h = 0,
  s: number,
  v: number,
  diff: number,
  diffc: (n: number) => number,
  percentRoundFn: (n: number) => number;

  rabs = r / 255;
  gabs = g / 255;
  babs = b / 255;
  v = Math.max(rabs, gabs, babs),
  diff = v - Math.min(rabs, gabs, babs);
  diffc = (c: number) => (v - c) / 6 / diff + 1 / 2;
  percentRoundFn = (num: number) => Math.round(num * 100) / 100;
  if (diff == 0) {
    h = s = 0;
  } else {
    s = diff / v;
    rr = diffc(rabs);
    gg = diffc(gabs);
    bb = diffc(babs);

    if (rabs === v) {
      h = bb - gg;
    } else if (gabs === v) {
      h = (1 / 3) + rr - bb;
    } else if (babs === v) {
      h = (2 / 3) + gg - rr;
    }
    if (h < 0) {
      h += 1;
    } else if (h > 1) {
      h -= 1;
    }
  }
  return [
    Math.round(h * 360),
    percentRoundFn(s * 100),
    percentRoundFn(v * 100)
  ];
}

function ColorDisplay({c}: {c: string}) {

  const [copied, setCopied] = useState(false);

  const write = async (text: string) => {
    await navigator.clipboard.writeText(text);
    setCopied(true);
  }

  return <Tooltip
    title="Copied!"
    arrow
    placement="top"
    open={copied}
  >
    <Box
      onMouseLeave={() => {
        setCopied(false);
      }}
      onClick={() => {
        write(c);
      }}
      sx={theme => ({
        width: 48,
        height: 48,
        backgroundColor: c,
        ':hover': {
          outline: `1px solid ${theme.palette.success.main}`,
          boxShadow: `0 0 5px ${theme.palette.success.main}`,
          zIndex: 2,
          cursor: 'pointer',
          '>div': {
            opacity: 1
          }
        },
        display: 'flex',
        justifyContent: 'end',
        alignItems: 'start'
      })}
    >
      {
        copied
        ? null
        : <Box
          sx={{
            borderRadius: 1,
            backgroundColor: '#0005',
            padding: '1px',
            opacity: 0,
            transition: 'all ease-in-out 0.1s'
          }}
        >
          <ContentCopyIcon sx={{color: 'white'}} />
        </Box>
      }
    </Box>
  </Tooltip>
}

function PaletteDisplay({
  bitmapPromise,
  threshold,
  minAlpha,
  max,
  onColList
}: {
  bitmapPromise?: Promise<ImageData | undefined>,
  threshold: number,
  minAlpha: number,
  max: number,
  onColList?: (colList: string[]) => void
}) {
  const [bitmap, setBitmap] = useState<ImageData>();

  const imgId = useRef(Symbol());
  useEffect(() => {
    const thisImgId = Symbol();
    imgId.current = thisImgId;

    bitmapPromise
    ?.then(bmp => {
      if (thisImgId === imgId.current) {
        setBitmap(bmp);
      }
    });
  }, [bitmapPromise]);

  const {
    colList,
    tooMany
  } = useMemo(() => {
    if (!bitmap) return {colList: undefined, tooMany: false};
    const colors: {rgb: [number,number,number]}[] = [];
    let exceededMax = false;
    let tooMany = false;
    for (let i = 0; i < bitmap.data.length; i += 4) {
      if (colors.length > max) {
        exceededMax = true;
      }
      const alpha = bitmap.data[i + 3];
      if (alpha <= minAlpha) continue;
      const rgb: [number,number,number] = [bitmap.data[i], bitmap.data[i + 1], bitmap.data[i + 2]];

      // Compare with previous established colours
      let skip = false;
      for (const c of colors) {
        // Skip if they are too similar
        if (
          (
            c.rgb[0] === rgb[0]
            && c.rgb[1] === rgb[1]
            && c.rgb[2] === rgb[2]
          ) ||
          (
            threshold !== 0
            && deltaE(c.rgb, rgb) <= threshold
          )
        ) {
          skip = true;
          continue;
        }
      }
      if (skip) continue;

      if (!exceededMax) {
        colors.push({
          rgb: [bitmap.data[i], bitmap.data[i + 1], bitmap.data[i + 2]]
        })
      } else {
        tooMany = true;
        break;
      }
    }

    // Key to sort colours
    // https://www.alanzucconi.com/2015/09/30/colour-sorting/
    // using Step sorting
    const key = (r: number, g: number, b: number, repetitions = 1): [h2: number, lum2: number, v2: number] => {
      const lum = Math.sqrt(.241 * r + .691 * g + .068 * b);
      const [h, _, v] = rgb2hsv(r, g, b);
      const h2 = Math.floor(h * repetitions);
      const lum2 = Math.floor(lum * repetitions);
      const v2 = Math.floor(v * repetitions);
      return [h2, lum2, v2];
    };

    return {
      colList: colors
      .map((c) => {
        return {rgb: c.rgb, key: key(c.rgb[0], c.rgb[1], c.rgb[2],8)};
      })
      .sort((a, b) => {
        return a.key[2] - b.key[2];
      })
      .sort((a, b) => {
        return a.key[1] - b.key[1];
      })
      .sort((a, b) => {
        return a.key[0] - b.key[0];
      })
      .map(c => rgbaToHex(c.rgb[0], c.rgb[1], c.rgb[2], 255)),
      tooMany
    }
  }, [bitmap, max]);

  const clRef = useRef(onColList);
  useEffect(() => {
    if (colList) clRef.current?.(colList);
  }, [colList]);

  if (!colList) return <Typography>
    No data
  </Typography>;

  return <Stack
    direction='row'
    flexWrap='wrap'
  >
    {
      colList.map(c => {
        return <ColorDisplay
          key={c}
          c={c}
        />
      })
    }
    {
      tooMany
      ? <Box
          sx={theme => ({
            height: 48,
            display: 'grid',
            justifyItems: 'start',
            alignItems: 'center',
            color: theme.palette.warning.main
          })}
        >
          <AddIcon />
        </Box>
      : null
    }
  </Stack>
}

function PaletteDetector() {
  const inputRef = useRef<HTMLInputElement>(null);

  const [image, setImage] = useState<File>();

  const [imageURL, setImageURL] = useState<string>();
  useEffect(() => {
    let newURL: string | null = null;
    if (image) {
      newURL = URL.createObjectURL(image);
      setImageURL(newURL);
    }

    return () => {
      if (newURL !== null)
        URL.revokeObjectURL(newURL);
    }
  }, [image]);

  const bitmapPromise = useMemo(async () => {
    if (!image) return;
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');
    const imgBm = await createImageBitmap(image);
    context?.drawImage(imgBm, 0, 0 );
    return context?.getImageData(0, 0, imgBm.width, imgBm.height);
  }, [image]);

  const [maxColors, setMaxColors] = useState(30);
  const [currentColors, setCurrentColors] = useState(-1);

  return (
    <>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        hidden
        onChange={e => {
          setImage(e.target.files?.[0]);
        }}
      />
      <Card>
        <CardContent>
          <Stack
            direction='row'
            justifyContent='center'
          >
            <Box
              onClick={() => inputRef.current?.click()}
              sx={theme => ({
                borderRadius: 2,
                outline: `3px dashed ${theme.palette.primary.main}`,
                display: 'grid',
                alignItems: 'center',
                textAlign: 'center',
                width: "80vw",
                height: "80vh",
                maxWidth: 400,
                maxHeight: 200,
                backgroundImage: imageURL ? `url(${imageURL})` : undefined,
                backgroundRepeat: 'no-repeat',
                backgroundPosition: 'center center',
                backgroundSize: 'contain',
                transition: 'all .2s ease-in-out',
                ':hover': {
                  outline: `3px dashed ${theme.palette.success.main}`,
                  cursor: 'pointer'
                },
                ':hover > div': {
                  background: theme.palette.success.main + '22'
                }
              })}
              onDragOver={e => e.preventDefault()}
              onDrop={e => {
                e.preventDefault();
                const file = e.dataTransfer.files[0];
                if (file.type.includes('image/')) {
                  setImage(file);
                }
              }}
            >
              <Box
                sx={theme => ({
                  backdropFilter: 'blur(5px)',
                  background: theme.palette.primary.main + '22',
                  transition: 'all .2s ease-in-out',
                })}
              >
                <Typography>
                  Click or drop your image here
                </Typography>
                {
                  image
                  ? <Typography>"{image.name}"</Typography>
                  : null
                }
              </Box>
            </Box>
          </Stack>
          <br />
          <Typography gutterBottom>Max colours</Typography>
          <Grid container spacing={2} alignItems="center" maxWidth={300}>
            <Grid item xs>
              <Slider
                value={maxColors}
                onChange={(_, newVal) => {
                  setMaxColors(typeof newVal === 'number' ? newVal : newVal[0] ?? 0);
                }}
                valueLabelDisplay="auto"
                shiftStep={10}
                step={1}
                marks
                min={10}
                max={200}
              />
            </Grid>
            <Grid item>
              <Input
                value={maxColors}
                size="small"
                onChange={(event) => {
                  setMaxColors(event.target.value === '' ? 0 : Number(event.target.value));
                }}
                onBlur={() => {
                  if (maxColors < 0) {
                    setMaxColors(0);
                  } else if (maxColors > 100) {
                    setMaxColors(100);
                  }
                }}
                inputProps={{
                  step: 1,
                  min: 10,
                  max: 200,
                  type: 'number',
                  'aria-labelledby': 'input-slider',
                }}
              />
            </Grid>
          </Grid>
          <br />
          <Typography>
            Palette ({currentColors != -1 ? currentColors : '-'}):
          </Typography>
          <PaletteDisplay
            threshold={1}
            minAlpha={10}
            bitmapPromise={bitmapPromise}
            max={maxColors}
            onColList={cl => setCurrentColors(cl.length)}
          />
        </CardContent>
      </Card>
    </>
  )
}

export default PaletteDetector
