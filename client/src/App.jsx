import { useState, useEffect, useRef } from 'react'
import axios from 'axios'
import './App.css'
import { Routes, Route, Link, } from 'react-router-dom';


function Home() {
  return (
    <div className="w-full  flex flex-col items-start bg-(--bg-primary) text-(--text-primary) p-8 md:p-16 lg:p-24">
      <h1 className="text-4xl font-bold mb-4">Welcome to CarlVision</h1>
      <p className="text-lg mb-8">Upload an image and apply various filters to it.</p>
      <Link to="/app" className="px-6 py-3 bg-blue-500 text-white rounded hover:bg-blue-600 transition duration-300">
        Get Started
      </Link>
    </div>
  );
}

function ImagePageBase() {
  const [myValue, setMyValue] = useState({})
  const [image, setImage] = useState(null)
  const [uploadedImage, setUploadedImage] = useState(null);
  const [imageAttributes, setImageAttributes] = useState(null);
  const [error, setError] = useState(null);
  const formRef = useRef(null);

  useEffect(() => {
    if (!image) return;
    const timer = setTimeout(() => { 
      console.log("value: ", myValue, )
      formRef.current?.requestSubmit();
    }, 500);
    setError(null);
    return () => clearTimeout(timer);
  }, [myValue, image])

  useEffect(() =>{
    if (imageAttributes){
      console.log("attributes: ", imageAttributes);
      localStorage.setItem("Attributes", JSON.stringify({channels: imageAttributes.Channels, dimensions: [imageAttributes.Dimensions[0], imageAttributes.Dimensions[1]]}))
    }
  }, [imageAttributes])

  const uploadImageOnSubmit = async (e) => {
    e.preventDefault();

    const formData = new FormData(e.target);
    const configs = Object.fromEntries(
      formData.entries()
    );
    const totalconfigs = {};
    const fixedConfigs = {};

    totalconfigs.GB = {name: "Gaussian Blur", kernalsize: Number(configs.gaussianBlurKernalSize)};
    totalconfigs.MB = {name: "Median Blur", kernalsize: Number(configs.medianBlurKernalSize)};
    totalconfigs.BB = {name: "Bilateral Filter", diameter: Number(configs.bilateralBlurDiameter), sigmaColor: Number(configs.bilateralBlurSigmaColor), sigmaSpace: Number(configs.bilateralBlurSigmaSpace)};
    totalconfigs.CF = {name: "Canny Filter", threshold1: Number(configs.cannyFilterThreshold1), threshold2: Number(configs.cannyFilterThreshold2)};
    
    Object.keys(totalconfigs).forEach((key) => {
      Object.keys(totalconfigs[key]).forEach((subkey) => {
        if (typeof totalconfigs[key][subkey] === 'number' && totalconfigs[key][subkey] > 1) {
            fixedConfigs[key] = {...totalconfigs[key]}; 
          }
        })
      }
    );
    
    formData.append("image", image);
    formData.append("config", JSON.stringify(fixedConfigs));
      console.log("YES HELLO MASSIVE LEGEND HERE: ", fixedConfigs, )

    try{
      const res = await axios.post('http://localhost:8080/api/upload', formData, {responseType:"blob"})
      const res2 = await axios.post('http://localhost:8080/api/imageattributes', formData, )
      console.log("Recieved processed image response! ", res2.data)
      const imageURL = URL.createObjectURL(res.data);
      setUploadedImage(imageURL);
      setImageAttributes(res2.data)
    }catch (err){
      setError( err)
      console.error('Error uploading image: ', err)
    }
  }

  const handleImageChange = (e) => {
    e.preventDefault()
    try{
      const file = e.target.files[0]
      if (file) setImage(file);
    } catch (err) {
      console.error("ts barnicals (from handleImageChange)")
    }
    
  }

  return (
    <div id="content" className="w-[95%] mx-auto flex flex-row gap-2.5">
          <section id="image_" className="flex-1 min-w-0">
            <div className=" w-full  relative p-3 flex flex-col gap-4">
              {error && (
                
                <div className="w-full bg-red-500/10 border border-red-500/40 text-red-400 p-3 rounded-lg text-sm">
                  <span className="font-semibold">Processing error:</span> {error}
                </div>
              )}
              <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
                {/* input image */}
                <div className="flex flex-col rounded-xl overflow-hidden border border-(--border) p-4" >
                  <div className="flex items-center justify-between px-4 py-3 border-b border-(--border)">
                    <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-blue-400"></span>
                      Original Image: 
                    </div>
                  </div>
                  <div className="relative min-h-[320px] h-[520px] flex flex-col justify-center items-center hover:bg-(--bg-tertiary) transition-all duration-200 cursor-pointer" onDragOver={(e) => e.preventDefault()} onDrop={(e) => e.preventDefault()} >
                    <label htmlFor="fileInput" className="">
                      {image ? (
                        <span className="text-sm text-(--text-secondary) p-1.5 hover:border hover:border-blue-400 transition-all duration-200">Change your image</span>
                      ) : (
                        <span className="text-sm text-(--text-secondary) ">Drag and drop an image here, or click to select one</span>
                      )}
                      <input type="file" id="fileInput" accept="image/*" onChange={handleImageChange} className="hidden"/>
                    </label>
                    {image && <img src={URL.createObjectURL(image)} alt="Dropped" className="object-scale-down  max-h-130 p-4" />}

                  </div>
                  {/* image attributes */}

                  <div className="flex flex-row justify-between gap-2 px-4 py-3 border-t border-(--border)">
                  <div className="flex flex-row justify-between w-full  mx-auto  gap-2">
                      <div className="rounded-lg bg-(--bg-tertiary) p-3">
                        <p className="text-sm text-(--text-muted) mb-1">Dimensions</p>
                        <p className="font-semibold">
                          {imageAttributes
                            ? `${imageAttributes.Dimensions[0]} × ${imageAttributes.Dimensions[1]}`
                            : "-- x --"}
                        </p>
                      </div>

                      <div className="rounded-lg bg-(--bg-tertiary) p-3">
                        <p className="text-sm text-(--text-muted) mb-1">Channels</p>
                        <p className="font-semibold">
                          {imageAttributes?.Channels ?? "--"}
                        </p>
                      </div>
                  </div>
                </div>
                </div>
                <div className="flex flex-col rounded-xl overflow-hidden border border-(--border) p-4" >
                  <div className="flex items-center justify-between px-4 py-3 border-b border-(--border)">
                    <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-blue-400"></span>
                      Processed Image: 
                    </div>
                  </div>
                  <div className="relative min-h-[320px] h-[520px] flex flex-col justify-center items-center" >
                    {uploadedImage ? (
                      <img src={uploadedImage} alt="Processed" className="object-scale-down  max-h-130 p-4" />
                    ) : (
                      <span className="text-sm text-(--text-secondary) ">Your processed image will appear here after applying configurations.</span>
                    )}
                  </div>
                  <div className="flex flex-row justify-between gap-2 px-4 py-3 border-t border-(--border)">
                  <div className="flex flex-row justify-between w-full  mx-auto  gap-2">
                      <div className="rounded-lg bg-(--bg-tertiary) p-3">
                        <p className="text-sm text-(--text-muted) mb-1">Status</p>
                        <p className="font-semibold">
                          {uploadedImage ? "Complete" : "Waiting"}
                        </p>
                      </div>

                      <div className="rounded-lg bg-(--bg-tertiary) p-3">
                        <p className="text-sm text-(--text-muted) mb-1">Output</p>
                        <p className="font-semibold">
                          {uploadedImage ? "PNG" : "--"}
                        </p>
                      </div>
                  </div>
                </div>
                </div>
              </div>
            </div>
          </section>
          <section id="inputs" className=" w-[360px] shrink-0">
            <form ref={formRef} onSubmit={uploadImageOnSubmit} className="w-full h-full flex flex-col border-l border-(--border) bg-(--bg-primary) shadow-2xl p-4 gap-4 overflow-y-auto">
              <div className="flex items-center justify-between border-b border-(--border) pb-3">
                <div>
                  <h3 className="text-lg font-semibold text-(--text-primary)">Configurations</h3>
                  <p className="text-xs text-(--text-muted)">Adjust image processing parameters</p>
                </div>
                <span className="text-xs text-(--text-muted) font-mono">CV / 01</span>
                {/* ^^kinda like a page number, but not really since i havent made a second page of configurations yet. but i will eventually. maybe. idk. */}
              </div>

              <div className="flex flex-col gap-3">

                <section className="flex flex-col gap-3 rounded-lg border border-(--border) bg-(--bg-secondary) p-3">
                  <div className="flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-(--accent)"></span>
                    <h4 className="font-semibold text-(--text-primary)">Gaussian Blur</h4>
                  </div>
                  <div className="flex flex-col gap-2">
                    <label className="text-sm text-(--text-secondary)">Kernel Size</label>
                    <div className="flex justify-between text-xs font-mono text-(--text-muted)">
                      <span>1</span>
                      <span className="text-(--accent) font-semibold">{myValue.GB?.kernalsize ?? 1}</span>
                      <span>31</span>
                    </div>
                    <input type="range" name="gaussianBlurKernalSize" min={1} max={31} step={2} value={myValue.GB?.kernalsize ?? 1} onChange={(e) => setMyValue({...myValue, GB:{name: "Gaussian Blur", kernalsize: Number(e.target.value)}})} className="w-full cursor-pointer accent-(--accent)"/>
                  </div>
                </section>

                <section className="flex flex-col gap-3 rounded-lg border border-(--border) bg-(--bg-secondary) p-3">
                  <div className="flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-(--accent)"></span>
                    <h4 className="font-semibold text-(--text-primary)">Median Blur</h4>
                  </div>
                  <div className="flex flex-col gap-2">
                    <label className="text-sm text-(--text-secondary)">Kernel Size</label>
                    <div className="flex justify-between text-xs font-mono text-(--text-muted)">
                      <span>1</span>
                      <span className="text-(--accent) font-semibold">{myValue.MB?.kernalsize ?? 1}</span>
                      <span>31</span>
                    </div>
                    <input type="range" name="medianBlurKernalSize" min={1} max={31} step={2} value={myValue.MB?.kernalsize ?? 1} onChange={(e) => setMyValue({...myValue, MB:{name: "Median Blur", kernalsize: Number(e.target.value)}})} className="w-full cursor-pointer accent-(--accent)"/>
                  </div>
                </section>

                <section className="flex flex-col gap-3 rounded-lg border border-(--border) bg-(--bg-secondary) p-3">
                  <div className="flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-(--accent)"></span>
                    <h4 className="font-semibold text-(--text-primary)">Bilateral Filter</h4>
                  </div>

                  <div className="flex flex-col gap-3">
                    <div className="flex flex-col gap-2">
                      <label className="text-sm text-(--text-secondary)">Diameter</label>
                      <div className="flex justify-between text-xs font-mono text-(--text-muted)">
                        <span>1</span>
                        <span className="text-(--accent) font-semibold">{myValue.BB?.diameter ?? 1}</span>
                        <span>15</span>
                      </div>
                      <input type="range" name="bilateralBlurDiameter" min={1} max={15} step={2} value={myValue.BB?.diameter ?? 1} onChange={(e) => setMyValue({...myValue, BB:{...myValue.BB, name: "Bilateral Filter", diameter: Number(e.target.value)}})} className="w-full cursor-pointer accent-(--accent)"/>
                    </div>

                    <div className="flex flex-col gap-2">
                      <label className="text-sm text-(--text-secondary)">Sigma Color</label>
                      <div className="flex justify-between text-xs font-mono text-(--text-muted)">
                        <span>1</span>
                        <span className="text-(--accent) font-semibold">{myValue.BB?.sigmaColor ?? 1}</span>
                        <span>150</span>
                      </div>
                      <input type="range" name="bilateralBlurSigmaColor" min={1} max={150} step={2} value={myValue.BB?.sigmaColor ?? 1} onChange={(e) => setMyValue({...myValue, BB:{...myValue.BB, name: "Bilateral Filter", sigmaColor: Number(e.target.value)}})} className="w-full cursor-pointer accent-(--accent)"/>
                    </div>

                    <div className="flex flex-col gap-2">
                      <label className="text-sm text-(--text-secondary)">Sigma Space</label>
                      <div className="flex justify-between text-xs font-mono text-(--text-muted)">
                        <span>1</span>
                        <span className="text-(--accent) font-semibold">{myValue.BB?.sigmaSpace ?? 1}</span>
                        <span>150</span>
                      </div>
                      <input type="range" name="bilateralBlurSigmaSpace" min={1} max={150} step={2} value={myValue.BB?.sigmaSpace ?? 1} onChange={(e) => setMyValue({...myValue, BB:{...myValue.BB, name: "Bilateral Filter", sigmaSpace: Number(e.target.value)}})} className="w-full cursor-pointer accent-(--accent)"/>
                    </div>
                  </div>
                </section>

                <section className="flex flex-col gap-3 rounded-lg border border-(--border) bg-(--bg-secondary) p-3">
                  <div className="flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-(--accent)"></span>
                    <h4 className="font-semibold text-(--text-primary)">Canny Filter</h4>
                  </div>

                  <div className="flex flex-col gap-3">
                    <div className="flex flex-col gap-2">
                      <label className="text-sm text-(--text-secondary)">Lower Threshold</label>
                      <div className="flex justify-between text-xs font-mono text-(--text-muted)">
                        <span>1</span>
                        <span className="text-(--accent) font-semibold">{myValue.CF?.threshold1 ?? 1}</span>
                        <span>250</span>
                      </div>
                      <input type="range" name="cannyFilterThreshold1" min={1} max={250} step={2} value={myValue.CF?.threshold1 ?? 1} onChange={(e) => setMyValue({...myValue, CF:{...myValue.CF, name: "Canny Filter", threshold1: Number(e.target.value)}})} className="w-full cursor-pointer accent-(--accent)"/>
                    </div>

                    <div className="flex flex-col gap-2">
                      <label className="text-sm text-(--text-secondary)">Upper Threshold</label>
                      <div className="flex justify-between text-xs font-mono text-(--text-muted)">
                        <span>1</span>
                        <span className="text-(--accent) font-semibold">{myValue.CF?.threshold2 ?? 1}</span>
                        <span>350</span>
                      </div>
                      <input type="range" name="cannyFilterThreshold2" min={1} max={350} step={2} value={myValue.CF?.threshold2 ?? 1} onChange={(e) => setMyValue({...myValue, CF:{...myValue.CF, name: "Canny Filter", threshold2: Number(e.target.value)}})} className="w-full cursor-pointer accent-(--accent)"/>
                    </div>
                  </div>
                </section>
              </div>
            </form>
          </section>
        </div>
  )
}


function App() {
  const [apiData, setApiData] = useState(null)
  

  return (
    <>
      <div className="min-h-screen md:min-h-dvh ">
        {/* <div className=" mx-auto text-[#999] text-center bg-[#f0f0f0]">
          <FishCheck />
        </div> */}

        <section id="header">
          <div className="w-full  bg-(--bg-primary)  text-xl text-(--text-primary) border-b-2 border-(--border)">
            <div className='w-[90%] p-2.5 mx-auto flex flex-row items-center justify-between '>
              <Link to="/" className='text-2xl hover:underline'>CarlVision</Link>
              <div className="w-[20%]  flex gap-3">
                <label className="hover:underline">More from Us</label>
                <label className="hover:underline">About Us</label>
              </div>

            </div>
          </div>
        </section>

        <section id="display-area" className="w-full min-h-[calc(100vh-54px)] bg-(--bg-primary) text-(--text-primary)">
          <Routes>
            <Route path="/" element={<Home/>}/>
            <Route path="/app" element={<ImagePageBase/>}/>
          </Routes>
        </section>

        
      
      </div>



    </>
  )
}

export default App
