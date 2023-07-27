import React from "react";
import { withAuthenticator } from "@aws-amplify/ui-react";
import "@aws-amplify/ui-react/styles.css";
import { Button, Heading, View, Card } from "@aws-amplify/ui-react";

const LoginPage = ({ signOut }) => {
  return (
    <View className="App">
     
      <Card>
        <Heading level={1}>We now have Auth!</Heading>
      </Card>
      <Button onClick={signOut}>Sign Out</Button>
    </View>
  );
};

export default withAuthenticator(LoginPage);
