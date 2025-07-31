import { Tabs } from "expo-router";

const Layout = () => {
    return (
        <Tabs>
            <Tabs.Screen name="contacts" options={{ headerShown: false }} />
            <Tabs.Screen name="calendar" options={{ headerShown: false }} />
            <Tabs.Screen name="profile" options={{ headerShown: false }} />
        </Tabs>
    );
};

export default Layout;