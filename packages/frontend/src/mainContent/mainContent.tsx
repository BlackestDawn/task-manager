import { justDate } from "@task-manager/common"

function MainContent() {
  return (
    <div>
      <p>Main Content</p>
      <p>It works, today is {justDate(new Date())}</p>
    </div>
  )
}

export default MainContent
