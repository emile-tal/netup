import Header from '../components/Header';
import ProfileCard from '../components/profile/ProfileCard';
import ScreenLayout from '../components/ScreenLayout';
import { myContactData } from '../placeholderData';

// NOTE: still placeholder-backed. Unlike calendar/agenda, "my profile" has nowhere to
// persist to yet — the owner's own record needs its own storage decision (a singleton
// row, a flag on contacts, or app settings) before this can be wired to the repo layer.
const Profile = () => {
  const contact = myContactData;
  return (
    <ScreenLayout>
      <Header title='My Profile' />
      <ProfileCard contact={contact} />
    </ScreenLayout>
  );
};

export default Profile;
