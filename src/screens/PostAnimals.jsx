import React, { useState, useRef, useEffect } from 'react'
import { collection, doc, writeBatch } from "firebase/firestore";
import { useNavigation } from '@react-navigation/native';
import { SelectList } from 'react-native-dropdown-select-list'
import { Text, TextInput } from 'react-native-paper'
import { TouchableOpacity, StyleSheet, View, Switch, Image, Dimensions, FlatList, Alert } from 'react-native';

import CalendarPicker from 'react-native-calendar-picker';

import { firestore } from '../../firebase.js';

// Import for all components
import Button from '../components/Button';
import ImageDropper from '../components/ImageDropper';
import SearchLocationInput from '../components/SearchLocationInput';
import Select from '../components/Select';

export default function PostAnimals(props) {

  const navigation = useNavigation();
  const selectREF1 = useRef(null)
  const selectREF2 = useRef(null)
  const imageDropperRef = useRef(null)

  const [LIST, setLIST] = useState([]);
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [LatLng, setLatLng] = useState({});

  const [location, setLocation] = useState("");
  const [imageURL, setImageURL] = useState("");
  const [imageUploading, setImageUploading] = useState(false);

  const [comments, setComments] = useState({ value: '', error: '' });
  const [phoneNumber, setPhoneNumber] = useState({ value: '', error: '' });

  const [selected1, setSelected1] = useState("");
  const [selected2, setSelected2] = useState("");
  const [selectedStartDate, setSelectedStartDate] = React.useState(null);
  const [selectedEndDate, setSelectedEndDate] = React.useState(null);
  const minDate = new Date(); // Today
  // A year out from today, computed dynamically so the picker doesn't end up
  // with a maxDate in the past (and every day disabled) once a hardcoded
  // date rolls by.
  const maxDate = new Date(minDate.getFullYear() + 1, minDate.getMonth(), minDate.getDate());

  function onDateChange(date, type) {
    if (type === 'END_DATE') {
      setSelectedEndDate(date)
    } else {
      setSelectedStartDate(date)
      setSelectedEndDate(null)
    }
  }

  const [isEnabled, setIsEnabled] = useState(false);
  const [selectedtype, setSelectedType] = useState([]);
  const [title, setTitle] = useState({ value: '', error: '' });
  const [items, setItems] = useState([
    { label: 'Dog', value: 'Dog' },
    { label: 'Cat', value: 'Cat' },
    { label: 'Hamster', value: 'Hamster' },
    { label: 'Snake', value: 'Snake' },
    { label: 'Bird', value: 'Bird' },
    { label: 'Rabbit', value: 'Rabbit' },
    { label: 'Rat', value: 'Rat' },
    { label: 'Mouse', value: 'Mouse' },
    { label: 'Fish', value: 'Fish' },
    { label: 'Lizard', value: 'Lizard' },
    { label: 'Turtle', value: 'Turtle' },
  ]);

  const [groupID, setGroupID] = React.useState();

  useEffect(() => {
    setGroupID(Math.round(Math.random() * 1000000000));
  }, []);

  const toggleSwitch = () => setIsEnabled(previousState => !previousState);

  const empty = () => {
    return <View style={styles.empty}>
        <Text></Text>
      </View>
  }

  const Item = ({title, picture, index}) => <View style={styles.item} key={index}>
      <Image source={{uri: picture}}
        style={styles.icon}
      />
      <Text style={styles.title}>{title}</Text>
    </View>

  const [condition, setCondition] = useState([
    { label: 'Young', value: 'Young' },
    { label: 'Middle Age', value: 'Middle Age' },
    { label: 'Old', value: 'Old' },
  ]);

  function onAddItem() {
    if (!selectedStartDate) {
      Alert.alert('Missing date', 'Please select an availability date on the calendar.');
      return;
    }
    if (!title.value.trim()) {
      setTitle(title => ({ ...title, error: 'Title is required' }));
      Alert.alert('Missing title', 'Please enter a title before adding this item.');
      return;
    }

    // A title can contain characters like "/" that are invalid inside a
    // Firestore document path, so derive the id from Firestore's own
    // collision-free generator instead of the user-entered title.
    const docId = doc(collection(firestore, "animals")).id;
    const item = {
      docId,
      title: title.value,
      groupID: groupID,
      picture: imageURL,
      phoneNumber: phoneNumber.value,
      email: props.route.params.user.email,
      comments: comments.value,
      startDate: selectedStartDate.toDate(),
      endDate: (selectedEndDate || selectedStartDate).toDate(),
      dateCreated: new Date(),
      type: selected1,
      condition: selected2,
    }
    setLIST(LIST => [...LIST, item])
    setTitle({ value: '', error: '' })
    setSelected1("")
    setSelected2("")
    setLocation("")
    setImageURL('')
    imageDropperRef?.current?.reset();
  }

  async function onSubmitItems() {
    if (LIST.length === 0) {
      Alert.alert('No items to submit', 'Add at least one listing before submitting.');
      return;
    }
    try {
      const batch = writeBatch(firestore);
      LIST.forEach(({ docId, ...data }) => {
        batch.set(doc(firestore, "animals", docId), data);
      });
      await batch.commit();
    } catch (e) {
      console.error('Failed to submit animal listings:', e);
      Alert.alert("Couldn't submit", 'Something went wrong submitting your listings. Please try again.');
      return;
    }
    setLIST([]);
    setGroupID(Math.round(Math.random() * 1000000000));
    Alert.alert('Listings submitted', 'Your animal listings were submitted successfully.');
    navigation.navigate('Adopt Animals');
  }

  return (
    <FlatList
      style={styles.container}
      data={LIST}
      ListEmptyComponent={empty}
      renderItem={({ item, index }) => (
        <Item title={item.title} picture={item.picture} index={index} />
      )}
      keyExtractor={(item, index) => index.toString()}
      ListFooterComponent={
        <View style={{ gap: 12, maxWidth: 650, width: "100%", marginHorizontal: "auto" }}>
          <View>
            <Text style={styles.formheading}>List Animals for Adoption</Text>
            <Text style={styles.formintro}>Help an animal find a safe home</Text>
            <Text style={styles.helperText}>Listing more than one animal? Add each animal individually below, then tap Submit Items once you've added everything.</Text>
          </View>
          <TextInput
            label="Title"
            returnKeyType="next"
            theme={{ colors: { primary: 'blue', underlineColor: 'transparent', } }}
            style={styles.forminputs}
            value={title.value}
            onChangeText={(text) => setTitle({ value: text, error: '' })}
            error={!!title.error}
            errorText={title.error}
            autoCapitalize="none"
          />

          <SearchLocationInput style={{width: "100%", height: 60}} location={location} setlatLng={(val) => {setLatLng(val)}} setLocation={setLocation} />

          <Select
            ref={selectREF1}
            setSelected={(val) => setSelected1(val)}
            data={items}
            placeholder="select type"
            boxStyles={{ width:"100%", marginBottom: 10 }}/>

          <Select
            ref={selectREF2}
            setSelected={(val) => setSelected2(val)}
            data={condition}
            placeholder="select condition"
            boxStyles={{ width:"100%", marginBottom: 10 }}/>

          <TextInput
            label="Phone Number"
            returnKeyType="next"
            theme={{ colors: { primary: 'blue', underlineColor: 'transparent', } }}
            style={styles.forminputs}
            value={phoneNumber.value}
            onChangeText={(text) => setPhoneNumber({ value: text, error: '' })}
            error={!!phoneNumber.error}
            errorText={phoneNumber.error}
            autoCapitalize="none"
            keyboardType='numeric'
          />
          <CalendarPicker
            startFromMonday={true}
            allowRangeSelection={true}
            minDate={minDate}
            maxDate={maxDate}
            todayBackgroundColor="#f2e6ff"
            selectedDayColor="#7300e6"
            selectedDayTextColor="#FFFFFF"
            onDateChange={onDateChange}
          />
          <TextInput
            label="Comments"
            returnKeyType="next"
            theme={{ colors: { primary: 'blue', underlineColor: 'transparent', } }}
            style={styles.forminputs}
            value={comments.value}
            onChangeText={(text) => setComments({ value: text, error: '' })}
            error={!!comments.error}
            errorText={comments.error}
            autoCapitalize="none"
          />
          <ImageDropper ref={imageDropperRef} setImageURL={setImageURL} onUploadingChange={setImageUploading} />
          <View style={styles.centered}>
            <Button mode="contained" onPress={onAddItem} style={styles.defaultsave} disabled={imageUploading}>
              + Save Item
            </Button>
            <Button mode="contained" onPress={onSubmitItems} style={styles.submitbutton} labelStyle={{ color: 'white' }} disabled={LIST.length === 0}>
              Submit Items
            </Button>
          </View>
        </View>
      }
    />
  )
}

const styles = StyleSheet.create({
  empty: {
    height: 20,
  },
  icon: {
    width: 36,
    height: 38,
  },
  centered: {
    alignItems: "center",
  },
  forgotPassword: {
    width: '100%',
    alignItems: 'center',
    marginBottom: 24,
  },
  row: {
    flexDirection: 'column',
    marginTop: 4,
    alignItems: 'center',
  },
  forgot: {
    fontSize: 13,
    color: "red",
  },
  link: {
    fontWeight: 'bold',
  },
  form: {
    alignItems: 'center',
    padding: 0,
    marginLeft: 20,
    marginRight: 120
  },
  deliverable: {
  },
  default: {
    backgroundColor: 'blue',
    width: 280,
    alignItems: "center",
  },
  defaultsave: {
    backgroundColor: 'green',
    width: 300,
    alignItems: "center",
  },
  submitbutton: {
    backgroundColor: 'blue',
    width: 300,
    alignItems: "center",
    marginBottom: 100,
  },
  helperText: {
    marginTop: 8,
    fontStyle: 'italic',
    color: '#555',
  },
  container: {
    flex: 1,
    backgroundColor: 'white',
    padding: 30,
  },
  item: {
    flexDirection: "row",
    backgroundColor: '#d3d3d3',
    padding: 15,
    marginVertical: 4,
    marginHorizontal: 4,
    justifyContent: "center",
    alignItems: "center",
  },
  title: {
    fontSize: 20,
    paddingLeft: 15,
  },
  quantity: {
    fontSize: 20,
    marginLeft: 'auto'
  },
  switch: {
    width: 30,
    marginRight: 20,
  },
  switchContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center"
  },
  forminputs: {
    width: "100%",
    zIndex: 2
  },
  formheading: {
    marginTop: 20,
    fontSize: 30,
  }
})