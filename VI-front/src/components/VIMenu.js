import * as React from 'react';
import Button from '@mui/material/Button';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import { Link } from 'react-router-dom';

export default function BasicMenu(props) {
  const [anchorEl, setAnchorEl] = React.useState(null);
  const open = Boolean(anchorEl);
  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };
  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleMenuItemClick = (menuItem) => {
   {
      handleClose();
    }
  }

  const handleSubMenuMouseEnter = () => {
    // 서브메뉴에 마우스가 들어왔을 때 메뉴를 닫지 않음
  };

  return (
    <div>
      <Button
        id="basic-button"
        aria-controls={open ? 'basic-menu' : undefined}
        aria-haspopup="true"
        aria-expanded={open ? 'true' : undefined}
        onClick={handleClick}
        style={{  color: 'black', fontSize: '20px' }}
      >
        {props.name}
      </Button>
      <Menu
        id="basic-menu"
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        MenuListProps={{
          'aria-labelledby': 'basic-button',
        }}
        
        onMouseLeave={handleClose}
        
      >
        <MenuItem>
        {
          props.name === "가상면접" ?
            <a style={{ textDecoration: 'none', color: 'inherit',  fontSize: '20px' }} href="http://localhost:3000/interview2">면접시작하기</a>
          :
          props.name === "스터디그룹" ?
            <a style={{ textDecoration: 'none', color: 'inherit', fontSize: '20px' }} href="http://localhost:3000/home">화상회의 시작하기</a>
          :
            null
        }
      </MenuItem>
        {props.submenuList.map((item, index) => (
          <MenuItem 
            key={index} 
            onClick={() => handleMenuItemClick(item.name)}
            onMouseEnter={handleSubMenuMouseEnter}
            style={{color: 'black', fontSize: '20px' }}
            className="custom-menu-item"
          >
            <Link 
              to={`${props.url}${item.url}`}
              style={{ textDecoration: 'none', color: 'inherit' }}
>{item.name}</Link>
          </MenuItem>
          ))}
      </Menu>
    </div>
  );
}