import { Grid } from "@mui/material";
import SideBar from "./SideBar";
import MainContainer from "./MainContainer";
import { Routes,Route } from "react-router-dom";





function Main(props) {
  const {sections} = props;

    return (
      <Grid container style={{ flexGrow: 1, width: '100%', height: '100vh', overflow: 'auto' }}>
        <Grid item xs={2} style={{ borderRight: "1px solid black" }}>
        <Routes>
          {sections.map(section => (
            <Route key={section.url} path={`${section.url}/*`} element={<SideBar title={section.title} submenu={section.submenu} />} />
          ))}
      </Routes>
        </Grid>
        <Grid item xs={10} style={{display:"flex" ,justifyContent:"center", alignItems:"center"}}>
        <Routes>
      {sections.map(section => (
        section.submenu.map(submenu => (
          <Route key={`${section.url}${submenu.url}`} path={`${section.url}${submenu.url}`} element={<MainContainer section={section} submenu={submenu} />} />
        ))
      ))}
    </Routes> 
        </Grid>
      </Grid>
    )
  }


  

  




export default Main;