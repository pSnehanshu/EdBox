import { useEffect, useState } from "react";
import { Button,StyleSheet,Pressable } from "react-native";
import { View, Text, TextInput } from "../../components/Themed";
import { useSchool } from "../../utils/useSchool";
import { RootStackScreenProps } from "../../utils/types/common";
import { trpc } from "../../utils/trpc";
import Spinner from "react-native-loading-spinner-overlay";
import { useSetAuthToken } from "../../utils/auth";
import SelectDropdown from 'react-native-select-dropdown'
import { AntDesign } from '@expo/vector-icons'
import config from "../../config";
import { FontAwesome } from "@expo/vector-icons";
import OtpPopup from "../../components/OtpPopup";

export default function LoginScreen({}: RootStackScreenProps<"Login">) {
  const school = useSchool();
  const [step, setStep] = useState<"requestOTP" | "submitOTP">("requestOTP");
  const [phone, setPhone] = useState("");
  const [otp, setOTP] = useState("");
  const [userId, setUserId] = useState<string | null>(null);
  const [formType, setFormType] = useState<"others" | "student">("student");
  const [sections, setSections] = useState({})
  const [selectedClass, setSelectedClass] = useState<number | null>(null);
  const [allSeections, setAllSeections] = useState<any | null>(null);

  const setAuthToken = useSetAuthToken();
  // fetchClassesAndSections
  const classesAndSectionsData = trpc.school.class.fetchClassesAndSections.useQuery({
    schoolId: config.schoolId,
  });
  console.log(allSeections,"result...")
  const allClassesData = classesAndSectionsData.data?.map(a => `Class `+a.name)
    console.log(classesAndSectionsData.data,"result...")
 
  useEffect(() => {
    if(selectedClass){
      const result = classesAndSectionsData.data?.filter(a => a.numeric_id===selectedClass)
      // console.log(result,"result")
      let temp = result?.map( (item) => item.Sections).flat();
      // console.log(temp,"result")
      const allSectionData = temp?.map(a => 'Section'+a.name)
      setAllSeections(allSectionData)
    }

  }, [selectedClass])
  
  
  const requestOtp = trpc.auth.requestPhoneNumberOTP.useMutation({
    onSuccess(data) {
      setUserId(data.userId);
      setStep("submitOTP");
    },
  });

  const requestrollNumberOTP = trpc.auth.rollNumberLoginRequestOTP.useMutation({
    onSuccess(data) {
      setUserId(data.userId);
      setStep("submitOTP");
    },
  })

  const submitOTP = trpc.auth.submitLoginOTP.useMutation({
    onSuccess(data) {
      setAuthToken(data.token, new Date(data.expiry_date));
    },
  });

  if (!school) return null;

  const countries = ["Egypt", "Canada", "Australia", "Ireland"]

  return (
    <View
      style={{
        height:"100%"
      }}
    >
      <Spinner
        visible={requestOtp.isLoading || submitOTP.isLoading}
        textContent="Please wait..."
      />
        {/* login */}
        <View style={styles.container}>
        <View style={styles.buttonContainer}>
          <Pressable
            style={
              formType === "others"
                ? styles.active_button
                : styles.default_button
            }
            onPress={() => setFormType("others")}
          >
            <Text style={
              formType === "others"
                ? styles.active_button_text
                : styles.default_button_text
            }>Others</Text>
          </Pressable>
          <Pressable
            style={
              formType === "student"
                ? styles.active_button
                : styles.default_button
            }
            onPress={() => setFormType("student")}
          >
            <Text style={
              formType === "student"
                ? styles.active_button_text
                : styles.default_button_text
            }>Student</Text>
          </Pressable>
        </View>
      </View>

      {step === "requestOTP" ?
      formType==="others" ?
      (
        <>
        {/* others */}
          <View>
            <Text style={styles.text}>Phone number:</Text>
            <TextInput
              style={styles.input}
              value={phone}
              onChangeText={setPhone}
              placeholder="Phone"
              autoFocus
              keyboardType="phone-pad"
              autoComplete="tel"
            />
            <Pressable
              style={styles.main_button}
              // title="Request OTP"
              onPress={() =>
                setStep("submitOTP")
                // requestOtp.mutate({
                //   phoneNumber: phone,
                //   schoolId: school.id,
                // })
              }
            >
              <Text style={styles.default_button_text}>Request OTP</Text>
            </Pressable>
          </View>
        </>
      ) : 
      (
        <>
        {/* student */}
        <View>
          <View style={{flexDirection:"row",marginLeft:24,marginRight:24}}>
            <View style={{width:"45%"}}>
              <Text style={styles.text_class}>Class</Text>
              <SelectDropdown
                  data={allClassesData ?? []}
                  // defaultValueByIndex={1}
                  // defaultValue={'Egypt'}
                  onSelect={(selectedItem, index) => {
                    console.log(selectedItem, index);
                    setSelectedClass(index)
                  }}
                  defaultButtonText={'Select Class'}
                  buttonTextAfterSelection={(selectedItem, index) => {
                    return selectedItem;
                  }}
                  rowTextForSelection={(item, index) => {
                    return item;
                  }}
                  buttonStyle={styles.dropdown1BtnStyle}
                  buttonTextStyle={styles.dropdown1BtnTxtStyle}
                  // renderDropdownIcon={isOpened => {
                  //   // return <FontAwesome name={isOpened ? 'chevron-up' : 'chevron-down'} color={'#FFF'} size={18} />;
                  //   return <FontAwesome name={'chevron-up'} color={'#FFF'} size={18} />;
                  // }}
                
                  dropdownIconPosition={'right'}
                  dropdownStyle={styles.dropdown1DropdownStyle}
                  rowStyle={styles.dropdown1RowStyle}
                  rowTextStyle={styles.dropdown1RowTxtStyle}
              />
            </View>
            <View style={{width:"45%",marginLeft:10}}>
              <Text style={styles.text_class}>Section</Text>
              <SelectDropdown
                  data={allSeections}
                  // defaultValueByIndex={1}
                  // defaultValue={'Egypt'}
                  onSelect={(selectedItem, index) => {
                    console.log(selectedItem, index);
                  }}
                  defaultButtonText={'Select Sections'}
                  buttonTextAfterSelection={(selectedItem, index) => {
                    return selectedItem;
                  }}
                  rowTextForSelection={(item, index) => {
                    return item;
                  }}
                  buttonStyle={styles.dropdown1BtnStyle}
                  buttonTextStyle={styles.dropdown1BtnTxtStyle}
                  renderDropdownIcon={isOpened => {
                    // return <FontAwesome name={isOpened ? 'chevron-up' : 'chevron-down'} color={'#FFF'} size={18} />;
                    return <FontAwesome name={'chevron-up'} color={'#FFF'} size={18} />;
                  }}
                
                  dropdownIconPosition={'right'}
                  dropdownStyle={styles.dropdown1DropdownStyle}
                  rowStyle={styles.dropdown1RowStyle}
                  rowTextStyle={styles.dropdown1RowTxtStyle}
              />
            </View>
          </View>
          <View style={{ }} >
            <Text style={styles.text}>Roll number:</Text>
            <TextInput
              style={styles.input}
              value={phone}
              onChangeText={setPhone}
              placeholder="Roll number"
              autoFocus
              keyboardType="phone-pad"
              autoComplete="tel"
            />
            <Pressable
              style={styles.main_button}
              // title="Request OTP"
              onPress={() =>
                // setStep("submitOTP")
                requestrollNumberOTP.mutate({
                  class_id: 1,
                  section_id: 1,
                  school_id: school.id,
                  rollnum: 1
                })
              }
            >
              <Text style={styles.default_button_text}>Request OTP</Text>
            </Pressable>
          </View>
          </View>
        </>
      )
      :(
        <>
        <OtpPopup otp={otp} setOTP={setOTP} visible={true} userId={userId}/>
          {/* <View>
            <Text>Enter OTP:</Text>
            <TextInput
              value={otp}
              onChangeText={setOTP}
              placeholder="OTP"
              autoFocus
              keyboardType="number-pad"
            />
            <Button
              title="Login"
              onPress={() => {
                if (userId) {
                  submitOTP.mutate({
                    userId,
                    otp,
                    schoolId: school.id,
                  });
                } else {
                  alert("User ID is still null");
                }
              }}
            />
          </View> */}
        </>
      )}
    </View>
  );
}


const styles = StyleSheet.create({
  container: {
    // flex: 1,
    padding: 20,
    flexDirection: "row",
    // height:"20%",
    // borderWidth: 1,
    // height: 10,
  },
  main_button:{
    // flex: 1,
    backgroundColor: "black",
    padding: 10,
    paddingBottom:16,
    margin:10,
    marginRight:20,
    marginLeft:20,
    borderWidth: 1,
    borderRadius: 15,
  },
  class_Section:{
    flexGrow:1,
    flexDirection: "row", 
    // justifyContent: "space-between",
    // padding:"10px"
    paddingLeft:20,
    paddingRight:20,
  },
  buttonContainer: {
    flex: 1,
    flexDirection: "row",
    borderWidth: 1,
    height: 55,
    backgroundColor: "black",
    borderRadius: 24,
  },
  default_button: {
    flex: 1,
    padding: 4,
    margin: 5,
    borderRadius: 20,
    backgroundColor: "black",
  },
  active_button: {
    flex: 1,
    padding: 4,
    margin: 5,
    borderRadius: 20,
    backgroundColor: "white",
  },
  text:{
    color: "black",
    paddingTop: 6,
    paddingLeft: 24,
    // textAlign: "center",
    fontSize: 18,
  },
  text_class:{
    color: "black",
    paddingTop: 6,
    paddingBottom:8,
    // paddingLeft: 24,
    // textAlign: "center",
    fontSize: 18,
  },
  default_button_text: {
    color: "white",
    paddingTop: 6,
    textAlign: "center",
    fontSize: 18,
  },
  active_button_text: {
    color: "black",
    paddingTop: 6,
    textAlign: "center",
    fontSize: 18,
  },
  input: {
    width:"90%",
    padding: 10,
    paddingLeft:16,
    marginRight:20,
    marginLeft:20,
    marginTop:8,
    borderWidth: 1,
    borderRadius: 15,
  },
  // 
  dropdown1BtnStyle: {
    width: '100%',
    // paddingLeft: 24,
    // paddingRight:24,
    height: 50,
    backgroundColor: '#FFF',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#444',
  },
  dropdown1BtnTxtStyle: {color: '#858585', textAlign: 'left', fontSize:14},
  dropdown1DropdownStyle: {backgroundColor: '#EFEFEF'},
  dropdown1RowStyle: {backgroundColor: '#EFEFEF', borderBottomColor: '#C5C5C5'},
  dropdown1RowTxtStyle: {color: '#2A2A2A', textAlign: 'left'},
});
