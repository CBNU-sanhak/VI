import { BorderRight } from "@mui/icons-material";
import { Link } from "react-router-dom";

function SideBar(props) {
  const { title, submenu } = props;

  // UI를 구성하는 로직 작성

  return (
    <div>
      {/* title, submenu 정보를 활용하여 UI 구성 */}
      <h1>{title}</h1>
      {submenu.map(item => (
        <p key={item.name}>{item.name}</p>
      ))}
    </div>
  );
}


export default SideBar;