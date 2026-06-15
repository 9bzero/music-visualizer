import{useState,useRef,useEffect,useCallback}from'react'
  type Mode='bars'|'wave'|'circle'
  export default function App(){
    const canvasRef=useRef<HTMLCanvasElement>(null)
    const audioCtxRef=useRef<AudioContext|null>(null)
    const analyserRef=useRef<AnalyserNode|null>(null)
    const sourceRef=useRef<MediaElementAudioSourceNode|null>(null)
    const animRef=useRef<number>(0)
    const audioRef=useRef<HTMLAudioElement>(null)
    const[playing,setPlaying]=useState(false)
    const[mode,setMode]=useState<Mode>('bars')
    const[color,setColor]=useState('#38bdf8')
    const[fileName,setFileName]=useState('')
    const modeRef=useRef(mode)
    const colorRef=useRef(color)
    modeRef.current=mode;colorRef.current=color

    const draw=useCallback(()=>{
      const canvas=canvasRef.current;const analyser=analyserRef.current
      if(!canvas||!analyser)return
      const ctx=canvas.getContext('2d')!
      const W=canvas.width,H=canvas.height
      const bufLen=analyser.frequencyBinCount
      const dataArr=new Uint8Array(bufLen)
      const loop=()=>{
        animRef.current=requestAnimationFrame(loop)
        analyser.getByteFrequencyData(dataArr)
        ctx.clearRect(0,0,W,H)
        ctx.fillStyle='rgba(15,23,42,0.85)'
        ctx.fillRect(0,0,W,H)
        const m=modeRef.current,c=colorRef.current
        if(m==='bars'){
          const bw=W/bufLen*2.5
          for(let i=0;i<bufLen;i++){
            const bh=(dataArr[i]/255)*H*0.9
            const x=i*(bw+1)
            const grad=ctx.createLinearGradient(x,H-bh,x,H)
            grad.addColorStop(0,c);grad.addColorStop(1,c+'33')
            ctx.fillStyle=grad
            ctx.fillRect(x,H-bh,bw,bh)
          }
        }else if(m==='wave'){
          analyser.getByteTimeDomainData(dataArr)
          ctx.strokeStyle=c;ctx.lineWidth=2;ctx.beginPath()
          const sw=W/bufLen
          for(let i=0;i<bufLen;i++){const y=(dataArr[i]/128)*H/2;i===0?ctx.moveTo(i*sw,y):ctx.lineTo(i*sw,y)}
          ctx.stroke()
        }else{
          const cx=W/2,cy=H/2,r=Math.min(W,H)*0.3
          for(let i=0;i<bufLen;i++){
            const angle=(i/bufLen)*Math.PI*2
            const amp=(dataArr[i]/255)*r*0.8
            const x1=cx+Math.cos(angle)*r,y1=cy+Math.sin(angle)*r
            const x2=cx+Math.cos(angle)*(r+amp),y2=cy+Math.sin(angle)*(r+amp)
            ctx.strokeStyle=c;ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(x1,y1);ctx.lineTo(x2,y2);ctx.stroke()
          }
          ctx.beginPath();ctx.arc(cx,cy,r,0,Math.PI*2);ctx.strokeStyle=c+'44';ctx.lineWidth=1;ctx.stroke()
        }
      }
      loop()
    },[])

    const loadFile=(e:React.ChangeEvent<HTMLInputElement>)=>{
      const file=e.target.files?.[0];if(!file)return
      setFileName(file.name)
      const url=URL.createObjectURL(file)
      if(audioRef.current){
        audioRef.current.src=url
        if(!audioCtxRef.current){
          const ctx=new AudioContext()
          const analyser=ctx.createAnalyser()
          analyser.fftSize=512
          const source=ctx.createMediaElementSource(audioRef.current)
          source.connect(analyser);analyser.connect(ctx.destination)
          audioCtxRef.current=ctx;analyserRef.current=analyser;sourceRef.current=source
          draw()
        }
      }
    }
    const togglePlay=()=>{
      const audio=audioRef.current;if(!audio)return
      if(playing){audio.pause();setPlaying(false)}
      else{audioCtxRef.current?.resume();audio.play();setPlaying(true)}
    }
    useEffect(()=>()=>{cancelAnimationFrame(animRef.current);audioCtxRef.current?.close()},[])
    return(
      <div style={{minHeight:'100vh',background:'#0f172a',display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',fontFamily:'Inter,system-ui,sans-serif',color:'#e2e8f0',padding:'2rem',gap:'1.5rem'}}>
        <h1 style={{fontWeight:800,fontSize:'1.75rem',color:'#f8fafc'}}>🎵 Music Visualizer</h1>
        <canvas ref={canvasRef} width={700} height={350} style={{borderRadius:16,border:'1px solid #1e293b',maxWidth:'100%'}}/>
        <div style={{display:'flex',gap:'0.75rem',flexWrap:'wrap',justifyContent:'center',alignItems:'center'}}>
          {(['bars','wave','circle'] as Mode[]).map(m=><button key={m} onClick={()=>setMode(m)} style={{padding:'0.4rem 1rem',background:mode===m?'#1e40af':'#1e293b',color:mode===m?'#93c5fd':'#94a3b8',border:'none',borderRadius:20,cursor:'pointer',fontWeight:500,fontSize:'0.85rem',textTransform:'capitalize'}}>{m}</button>)}
          <input type="color" value={color} onChange={e=>setColor(e.target.value)} title="Color" style={{width:36,height:36,border:'none',background:'none',cursor:'pointer',borderRadius:4}}/>
        </div>
        <div style={{display:'flex',gap:'1rem',alignItems:'center',flexWrap:'wrap',justifyContent:'center'}}>
          <label style={{padding:'0.65rem 1.5rem',background:'#1e293b',color:'#94a3b8',border:'1px solid #334155',borderRadius:8,cursor:'pointer',fontSize:'0.9rem'}}>
            📂 {fileName||'Open Audio File'}
            <input type="file" accept="audio/*" onChange={loadFile} style={{display:'none'}}/>
          </label>
          <button onClick={togglePlay} disabled={!fileName} style={{padding:'0.65rem 2rem',background:playing?'#dc2626':'#0ea5e9',color:'#fff',border:'none',borderRadius:8,cursor:'pointer',fontWeight:700,opacity:!fileName?0.5:1}}>
            {playing?'⏹ Stop':'▶ Play'}
          </button>
        </div>
        <audio ref={audioRef} onEnded={()=>setPlaying(false)} style={{display:'none'}}/>
        {!fileName&&<p style={{color:'#475569',fontSize:'0.85rem'}}>Load an MP3, WAV, or OGG file to start visualizing</p>}
      </div>
    )
  }