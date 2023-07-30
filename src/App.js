import React, { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import { Framework } from '@superfluid-finance/sdk-core';
import { 
  NativeBaseProvider, Text, Box, Select, 
  Center, CheckIcon, extendTheme, Input, FormControl, Stack,
  Button
} from "native-base";

const newColorTheme = {
  brand: {
    900: "#8287af",
    800: "#7c83db",
    700: "#b3bef6",
  },
};
const theme = extendTheme({ colors: newColorTheme });

function App() {

  var [flowreceiver, setFlowreceiver] = useState("");
  var [flowrate, setFlowrate] = useState("");
  var [cancelreceiver, setCancelreceiver] = useState("");
  var [streambalance, setStreambalance] = useState("-");
  var [profile, setProfile] = React.useState("employer");
  var [address, setAddress] = React.useState("");
  var [addressformat, setAddressformat] = React.useState("0x0000...0000");

  const connectWallet = async () => {
    try {
      const { ethereum } = window;
  
      if (!ethereum) {
        alert("Install the MetaMask wallet extension from https://metamask.io/download/");
        return;
      }
      const accounts = await ethereum.request({
        method: "eth_requestAccounts"
      });
      setAddress(accounts[0]);
    } catch (error) {
      console.log(error);
    }
  };

  async function balance(){
    try {
      const provider = new ethers.providers.Web3Provider(window.ethereum);
    
      const chainId = await window.ethereum.request({ method: "eth_chainId" });
      const sf = await Framework.create({
          chainId: Number(chainId),
          provider: provider
      });
    
      const cusdx = await sf.loadSuperToken("0x3acb9a08697b6db4cd977e8ab42b6f24722e6d6e");
      const accounts = await window.ethereum.request({ method: "eth_accounts" });
    
      const balance = await cusdx.balanceOf({
          account: accounts[0].toString(),
          providerOrSigner: provider
      });

      setStreambalance((balance/1000000000000000000).toString());
    
      
    }
    catch (error) {
      console.log("balanceerror: "+error);
    }
  }

  async function funcdeleteflow(receiver_){
    //0.024615460466057584 cusdx balance -> 0.005499219 cusdx/hour
    //1 cusdx balance -> 0.223405083 cusdx/hour

    try {
      const provider = new ethers.providers.Web3Provider(window.ethereum);
  
      const chainId = await window.ethereum.request({ method: "eth_chainId" });
      const sf = await Framework.create({
        chainId: Number(chainId),
        provider: provider
      });
    
      const signer = provider.getSigner();
    
      const cusdx = await sf.loadSuperToken("0x3acb9a08697b6db4cd977e8ab42b6f24722e6d6e");
      const superSigner = sf.createSigner({ signer: signer });
    
      const deleteflow = cusdx.deleteFlow({
        sender: await superSigner.getAddress(),
        receiver: receiver_
      });
    
      const deleteflowlog = await deleteflow.exec(signer);
    
      
    }
    catch (error) {
      console.log("deleteflowerror: "+error);
    }
  }

  async function funcgetflow() {
    // const provider = new ethers.providers.Web3Provider(window.ethereum);
    // const chainId = await window.ethereum.request({ method: "eth_chainId" });
    // const sf = await Framework.create({
    //     chainId: Number(chainId),
    //     provider: provider
    // });
    // const signer = provider.getSigner();
    // const cusdx = await sf.loadSuperToken("0x3acb9a08697b6db4cd977e8ab42b6f24722e6d6e");
    // const superSigner = sf.createSigner({ signer: signer });

    // // var flowinfo = cusdx.getAccountFlowInfo({
    // //   account: await superSigner.getAddress(),
    // //   providerOrSigner: provider
    // // });
    // var flowinfo = cusdx.getFlow({
    //   sender: provider.getSigner(),
    //   receiver: "0xa94A71d6E643693F381e7E94DC6Fb06320F39de2",
    //   providerOrSigner: provider
    // });
    // console.log("flowinfo: "+JSON.stringify(flowinfo));
  }

  async function funccreateflow(receiver_, rate_){
    //0.024615460466057584 cusdx balance -> 0.005499219 cusdx/hour
    const rate_persec = Math.round((Number(rate_)/3600) * 1000000000000000000).toString();
  
    try {
      const provider = new ethers.providers.Web3Provider(window.ethereum);
  
      const chainId = await window.ethereum.request({ method: "eth_chainId" });
      const sf = await Framework.create({
          chainId: Number(chainId),
          provider: provider
      });
  
      const signer = provider.getSigner();
  
      const cusdx = await sf.loadSuperToken("0x3acb9a08697b6db4cd977e8ab42b6f24722e6d6e");
      //const accounts = await window.ethereum.request({ method: "eth_accounts" });
      const superSigner = sf.createSigner({ signer: signer });
  
      const createflow = cusdx.createFlow({
        sender: await superSigner.getAddress(),
        receiver: receiver_,
        flowRate: rate_persec
      });
  
      const createflowlog = await createflow.exec(signer);
  
      setInterval(() => {
        if (address.length > 0) {
          balance();
        }
      }, 2500);
    }
    catch (error) {
      console.log("createflowerror: "+error);
    }
  }

  useEffect(() => {
    if (address.length > 0) {
      balance();
    }
    else{
      setStreambalance("-");
    }
  }, [address]);

  return (
    <NativeBaseProvider theme={theme}>
      <Center>
        <Box maxW="300">
          <Select selectedValue={profile} minWidth="200" accessibilityLabel="Profile" placeholder="Profile" _selectedItem={{
            bg: "teal.600",
            endIcon: <CheckIcon size="5" />
          }} mt={1} onValueChange={itemValue => {setProfile(itemValue)}}>
            <Select.Item label="Employer" value="employer" />
            <Select.Item label="Employee" value="employee" />
          </Select>
        </Box>
        <Text>{address.length != 0 ? address.substring(0, 6)+"..."+address.substring(38) : addressformat}</Text>
        <Text>{streambalance} cUSDx</Text>
        <Button size="sm" colorScheme="default" backgroundColor={"#55bf7d"} onPress={() => connectWallet()}>
          CONNECT WALLET
        </Button>
        { profile == "employer" ?
          <>
            <FormControl maxW="300" marginTop={75}>
              <Stack space={5}>
                <Stack>
                  <Input variant="underlined" p={2} placeholder="Receiver" onChangeText={text => setFlowreceiver(text)} />
                </Stack>
                <Stack>
                  <Input variant="underlined" p={2} placeholder="cUSDx (per hour)" onChangeText={text => setFlowrate(text)}/>
                </Stack>
              </Stack>
            </FormControl>
            <Button size="sm" 
              colorScheme="default"
              borderWidth={2}
              borderRadius={5}
              backgroundColor={"#ffffff"}
              borderColor={"#55bf7d"}
              onPress={() => funccreateflow(flowreceiver, flowrate)}>
              <Text color={"#55bf7d"}>STREAM</Text>
            </Button>
          </>
          : <></>}
        <FormControl maxW="300" marginTop={75}>
          <Stack space={5}>
            <Stack>
              <Input variant="underlined" p={2} placeholder="Receiver"onChangeText={text => setCancelreceiver(text)} />
            </Stack>
          </Stack>
        </FormControl>
        <Button size="sm" 
          colorScheme="default"
          borderWidth={2}
          borderRadius={5}
          backgroundColor={"#ffffff"}
          borderColor={"#55bf7d"}
          onPress={() => funcdeleteflow(cancelreceiver)}>
          <Text color={"#55bf7d"}>CANCEL STREAM</Text>
        </Button>
      </Center>
    </NativeBaseProvider>
  );
}

export default App;
