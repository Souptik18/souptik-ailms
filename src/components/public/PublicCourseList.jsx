import PublicSubjectView from './PublicSubjectView'

function PublicCourseList({ currentUserRole, enrolledVideoIds, onRegisterVideo, onEnrollVideo, onOpenSubjectVideo }) {
  return (
    <PublicSubjectView
      initialSubject="computerscience"
      mode="catalog"
      currentUserRole={currentUserRole}
      enrolledVideoIds={enrolledVideoIds}
      onRegisterVideo={onRegisterVideo}
      onEnrollVideo={onEnrollVideo}
      onSubjectNavigate={() => {}}
      onVideoOpen={onOpenSubjectVideo}
    />
  )
}

export default PublicCourseList
