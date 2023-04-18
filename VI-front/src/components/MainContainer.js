import { useParams } from "react-router-dom";

function MainContainer(props) {
  const { section, submenu } = props;

  // UI를 구성하는 로직 작성

  if(submenu.title === '면접시작하기'){
    return
  }
  return (
    <div>
      {/* section, submenu 정보를 활용하여 UI 구성 */}
      <h1>{section.title}</h1>
      <h2>{submenu.name}page</h2>
      {/* 해당 section, submenu에 맞는 컴포넌트 렌더링 */}
    </div>
  );
}
export default MainContainer;