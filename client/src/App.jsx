import { useState, useEffect } from 'react'
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
  const [submitted, setSubmitted] = useState(false)
  const [myValue, setMyValue] = useState({})
  const [valueConfigs, setValueConfigs] = useState([])
  const [image, setImage] = useState(null)
  const [uploadedImage, setUploadedImage] = useState(null);
  const [imageAttributes, setImageAttributes] = useState(null);
  
  useEffect(() => {
    if(submitted){
      console.log("value ",myValue)
      setValueConfigs(myValue)
    }
  }, [submitted])

  useEffect(() => {
    try{
      if (!valueConfigs || valueConfigs.length < 1) return;
      if (submitted){
        const configs = localStorage.getItem("configs") || {};
        if (configs.length > 0) {
          localStorage.removeItem("configs");
          localStorage.setItem("configs", JSON.stringify(valueConfigs))
          console.log("Uploaded configs! (around line:136)")

          return
        } 
        console.log("Uploaded configs! (around line:136)")
        localStorage.setItem("configs", JSON.stringify(valueConfigs))
      }
    }catch (err){
      console.log("Something went wrong with uploading settings! ", err)
      console.log("valueconfig: ", valueConfigs)

    }finally{
      console.log("frog")
    }
  }, [valueConfigs])

  useEffect(() =>{
    if (imageAttributes){
      console.log("attributes: ", imageAttributes);
      localStorage.setItem("Attributes", JSON.stringify({channels: imageAttributes.Channels, dimensions: [imageAttributes.Dimensions[0], imageAttributes.Dimensions[1]]}))
    }
  }, [imageAttributes])

  const uploadImage = async () => {
    const stored = localStorage.getItem("configs");
    let config = stored ? JSON.parse(stored) : null;
    if (!image || !config) return;
    if (config?.CF && config.CF.threshold1 === undefined && config.CF.threshold2 !== undefined) {
      const updated_configs = {...config, CF:{...config.CF, threshold1:100}}
      config = updated_configs
      console.log("log dog")
      
      localStorage.setItem("configs", JSON.stringify(config))
    }
    console.log("hog ", config)
    const formData = new FormData();
    formData.append("image", image);
    formData.append("config", JSON.stringify(config));
    try{
      const res = await axios.post('http://localhost:8080/api/upload', formData,{responseType:"blob"})
      console.log("Recieved processed image response! ", res.data.result)
      const imageURL = URL.createObjectURL(res.data);
      setUploadedImage(imageURL);
      setImageAttributes(res.data.result)
    }catch (err){
      setError('Error uploading image:', err)
    } finally{
      setPressed(prev => !prev)
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
    <div id="content" className="w-[95%] mx-auto flex flex-row">
          <section id="image_" className="flex-1 min-w-0">
            <div className=" w-full  p-3">
              <div className="w-full max-h-[720px] flex flex-row justify-between gap-2.5">
                <div className="w-full h-full max-w-[50%] mx-auto bg-[--bg-tertiary] flex flex-col items-center justify-center p-4 border-2 border-dashed border-gray-300 rounded-md" onDragOver={(e) => e.preventDefault()} onDrop={(e) => e.preventDefault()} >
                  <label htmlFor="fileInput" className=" flex flex-col">
                    Drop your image here: &nbsp; <input type="file" id="fileInput" accept="image/*"  onChange={handleImageChange} /> 
                  </label>
                  
                  {image && <img src={URL.createObjectURL(image)} alt="Dropped" className="object-scale-down  max-h-[520px] p-4" />}
                  {imageAttributes && (
                    <div className="mt-4">
                      <h3>Image Attributes:</h3>
                      <p>Channels: {imageAttributes.Channels}</p>
                      <p>Dimensions: {imageAttributes.Dimensions[0]} x {imageAttributes.Dimensions[1]}</p>
                    </div>
                  )}
                </div>
                <div className="w-full h-full max-w-[50%] mx-auto bg-[--bg-tertiary] flex flex-col items-center justify-center p-4 border-2 border-solid border-gray-300 rounded-md" onDragOver={(e) => e.preventDefault()} onDrop={(e) => e.preventDefault()} >
                  
                  {!uploadedImage && (
                  <label>
                      Your image will show up here!
                  </label>
                  )}
                  {uploadedImage && (
                  <img src={uploadedImage} alt="Processed" className="object-scale-down  max-h-[520px] p-4"/>
                  )}
                </div>
              </div>
            </div>
          </section>
          <section id="inputs" className=" w-[360px] shrink-0">
            <div className="w-full h-full border-l-2 shadow-2xl">
              <h3 className="p-2">Configurations:</h3>
              <div className="w-full mx-auto flex flex-col gap-1">
                <div className="flex flex-col  p-2">
                  <label className="text-lg">Gausssian Blur</label>
                  <div className="flex flex-col p-1 ">
                    <label>Kernal size</label>
                    <div className="flex flex-row mx-auto w-[80%] justify-between">
                      <p>1</p>
                      <p>{myValue.GB?.kernalsize ?? 1}</p>
                      <p>31</p>
                    </div>
                    {/* setValueConfigs({name: "Gaussian Blur", kernalsize: Number(e.target.value)}) && console.log(Number(e.target.value)) && */}
                    <input type="range" min={1} max={31} step={2} value={myValue.GB?.kernalsize ?? 1} onChange={(e => setMyValue({...myValue, GB:{name: "Gaussian Blur", kernalsize: Number(e.target.value)} }) )} className= "w-[80%] mx-auto cursor-pointer"/>
                  </div>
                </div>
                <div className="flex flex-col p-2">

                  <label className="text-lg">Median Blur</label>
                  <div className="flex flex-col p-1 ">
                    <label>Kernal size</label>
                    <div className="flex flex-row mx-auto w-[80%] justify-between">
                      <p>1</p>
                      <p>{myValue.MB?.kernalsize ?? 1}</p>
                      <p>31</p>
                    </div>
                    <input type="range" min={1} max={31} step={2} value={myValue.MB?.kernalsize ?? 1} onChange={(e => setMyValue({...myValue, MB:{name: "Median Blur", kernalsize: Number(e.target.value)} }) )} className= "w-[80%] mx-auto cursor-pointer"/>
                  
                  </div>
                </div>
                <div className="flex flex-col p-2">
                  <label className="text-lg">Bilateral Blur</label>
                  <div className="flex flex-col p-1 ">
                    <label>Diameter</label>
                    <div className="flex flex-row mx-auto w-[80%] justify-between">
                      <p>1</p>
                      <p>{myValue.BB?.diameter ?? 1}</p>
                      <p>15</p>
                    </div>
                    <input type="range" min={1} max={15} step={2} value={myValue.BB?.diameter ?? 1} onChange={(e => setMyValue({...myValue, BB:{...myValue.BB,name: "Bilateral Filter", diameter: Number(e.target.value)}}) )} className= "w-[80%] mx-auto cursor-pointer"/>

                    <label>Sigma Color</label>
                    <div className="flex flex-row mx-auto w-[80%] justify-between">
                      <p>1</p>
                      <p>{myValue.BB?.sigmaColor ?? 1}</p>
                      <p>150</p>
                    </div>
                    <input type="range" min={1} max={150} step={2} value={myValue.BB?.sigmaColor ?? 1} onChange={(e => setMyValue({...myValue, BB:{...myValue.BB, name: "Bilateral Filter", sigmaColor: Number(e.target.value), } }) )} className= "w-[80%] mx-auto cursor-pointer"/>

                    <label>Sigma Space</label>
                    <div className="flex flex-row mx-auto w-[80%] justify-between">
                      <p>1</p>
                      <p>{myValue.BB?.sigmaSpace ?? 1}</p>
                      <p>150</p>
                    </div>
                    <input type="range" min={1} max={150} step={2} value={myValue.BB?.sigmaSpace ?? 1} onChange={(e => setMyValue({...myValue, BB:{...myValue.BB, name: "Bilateral Filter", sigmaSpace: Number(e.target.value)} }) )} className= "w-[80%] mx-auto cursor-pointer"/>
                  </div>
                </div>           

                <div className="flex flex-col p-2">
                  <label className="text-lg">Canny Filter</label>
                  <div className="flex flex-col p-1 ">
                    <label>Lower Threshold</label>
                    <div className="flex flex-row mx-auto w-[80%] justify-between">
                      <p>1</p>
                      <p>{myValue.CF?.threshold1 ?? 1}</p>
                      <p>250</p>
                    </div>
                    <input type="range" min={1} max={250} step={2} value={myValue.CF?.threshold1 ?? 1} onChange={(e => setMyValue({...myValue, CF:{...myValue.CF,name: "Canny Filter", threshold1: Number(e.target.value)}}) )} className= "w-[80%] mx-auto cursor-pointer"/>

                    <label>Upper Threshold</label>
                    <div className="flex flex-row mx-auto w-[80%] justify-between">
                      <p>1</p>
                      <p>{myValue.CF?.threshold2 ?? 1}</p>
                      <p>350</p>
                    </div>
                    <input type="range" min={1} max={350} step={2} value={myValue.CF?.threshold2 ?? 1} onChange={(e => setMyValue({...myValue, CF:{...myValue.CF, name: "Canny Filter", threshold2: Number(e.target.value), } }) )} className= "w-[80%] mx-auto cursor-pointer"/>
                  </div>
                </div>         
              </div>
              <button type="button" onClick={() => setSubmitted(prev=>!prev)} className=" rounded-[5px] border-transparent p-2 
              bg-(--bg-tertiary) text-(--text-secondary) 
              transition-all duration-200 hover:bg-(--bg-secondary)">
                Upload Image
              </button>
            </div>
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
