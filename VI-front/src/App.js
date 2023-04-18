import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Grid } from '@mui/material';
import Container from '@mui/material/Container';
import Header from './components/Header';
import Main from './components/Main';
import { useState } from 'react';


// const [selectedSubMenu, setSelectedSubMenu] = useState(null);
// const navigate = useNavigate();

// const handleSubMenuClick = (subMenu) => {
//   setSelectedSubMenu(subMenu);
//   navigate(`/main/${subMenu}`); // URL 업데이트
// };


function App() {
  const sections = [
    { title: '가상면접', url: 'interview',submenu:[
      {
      name: '결과 확인', url:'/show'
      },
      {
        name: '질문리스트 확인', url:'/checkList'
      }]
     },
    { title: '스터디그룹', url: 'studygroup', submenu:[
      {
        name: '그룹 생성', url:'/create'
      },
      {
        name: '그룹 참여', url:'/join'
      },
      {
        name: '그룹 목록확인', url:'/showGroupList'
      }]
     },
    { title: '커뮤니티', url: 'community',submenu:[
      {
        name: '자유게시판', url:'/free'
      },
      {
        name: '면접게시판', url:'/interview'
      },
      {
        name: '취업게시판', url:'/jop'
      }]
    },
    { title: '마이페이지', url: 'mypage',submenu:[
      {
        name: '정보수정', url:'/change'
      },
      {
        name: '나의 면접', url:'/interview'
      },
      {
        name: '내가 쓴 글', url:'/wrote'
      },
      {
        name: '나의 스터디그룹', url:'/studygroup'
      },
      {
        name: '회원 탈퇴', url:'/widthdrawal'
      }] 
    },
    { title: '문의하기', url: 'inquiry', submenu:[{
      name: '문의사항', url:'/a'
    },
    
    {
      name: '건의사항', url:'/b'
    },
    {
      name: '공지사항', url:'/c'
    }]}
  ];

  const sectionsforAdmin = [
    { title: '커뮤니티 관리', url: 'interview',submenu:[
      {
      name: '게시글 삭제', url:'/start'
      },
      {
      name: '댓글 삭제', url:'/show'
      },]
     },
    { title: '고객센터관리', url: 'studygroup', submenu:[
      {
        name: '공지사항 등록', url:'/startVideoChat'
      },
      {
        name: '공지사항 삭제', url:'/create'
      },
      {
        name: '문의/건의사항 확인', url:'/join'
      },]
     },
    { title: '면접관리', url: 'mypage',submenu:[
      {
        name: '질문리스트등록', url:'/change'
      },
      {
        name: '질문리스트삭제', url:'/interview'
      },
      {
        name: '질문리스트수정', url:'/wrote'
      },
      {
        name: '질문리스트검색', url:'/studygroup'
      }] 
    }
  ];

  const [isAdmin, setIsAdmin] = useState(false);

  const handleAdminToggle = () => {
    setIsAdmin((prevIsAdmin) => !prevIsAdmin);
  };

  return (
    <Router basename={'/'}>
      <div style={{ width: '100%', height: '100vh', overflow: 'auto' }}>
        <Header title="VI" sections={isAdmin? sectionsforAdmin: sections} />
        <Main sections={isAdmin? sectionsforAdmin: sections}></Main>
      </div>
      <button style={{ position: 'fixed', bottom: 10, right: 5 }} onClick={handleAdminToggle}>
          {isAdmin ? 'Switch to User View' : 'Switch to Admin View'}
      </button>
    </Router>
    
  );

}



export default App;