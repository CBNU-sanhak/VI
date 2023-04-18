import * as React from 'react';
import PropTypes from 'prop-types';
import Toolbar from '@mui/material/Toolbar';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import SearchIcon from '@mui/icons-material/Search';
import Typography from '@mui/material/Typography';
import Link from '@mui/material/Link';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemText from '@mui/material/ListItemButton';
import VIMenu from './VIMenu';
function Header(props) {

  const { sections, title,} = props;


  return (
    <React.Fragment>
      <Toolbar sx={{ borderBottom: 1, borderColor: 'black' }}>
        <Typography
          component="h4"
          variant="h4"
          color="inherit"
          align="left"
          noWrap
          sx={{ flex: 1 }}
        >
          {title}
        </Typography>
        <Toolbar
        component="nav"
        variant="dense"
        sx={{ justifyContent: 'space-evenly', overflowX: 'auto' }}
      >
        {sections.map((section,id) => (
          <Button id={id} variant="text" size="Large">
            <VIMenu name = {section.title} url = {section.url} submenuList={section.submenu}/>
            {/* <Link
              underline="none"
              color="inherit"
              noWrap
              key={section.title}
              variant="body2"
              href={section.url}
              sx={{ p: 1, flexShrink: 0 }}
            >
              {section.title}
            </Link> */}
          </Button>
        ))}
      </Toolbar>
        <IconButton>
          <SearchIcon sx={{ fontSize:"60"}}/>
        </IconButton>
        <Button  href="/SignIn" variant="outlined" size="Large">
          <a style={{ textDecoration: 'none', color: 'inherit' }} href="http://localhost:3000/login">로그인</a>
        </Button>
        <Button  href="/SignUp" variant="outlined" size="Large" style={{margin:"6px"}}>
          회원가입
        </Button>
      </Toolbar>
    </React.Fragment>
  );
}

Header.propTypes = {
  sections: PropTypes.arrayOf(
    PropTypes.shape({
      title: PropTypes.string.isRequired,
      url: PropTypes.string.isRequired,
    }),
  ).isRequired,
  title: PropTypes.string.isRequired,
};


export default Header;