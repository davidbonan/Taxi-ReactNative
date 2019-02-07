import React from "react";
import { TouchableOpacity, StyleSheet} from "react-native";
import Icon from 'react-native-vector-icons/Ionicons';
import LinearGradient from 'react-native-linear-gradient';

import Colors from '../constants/Colors';

export default class AddButton extends React.Component {
    constructor(props) {
        super(props)

        this.state = {
            backgroundColor: this.props.backgroundColor ? this.props.backgroundColor : Colors.addButtonDefaultBackground
        }
    }

    render () {
        const { routeName, navigateTo } = this.props;
        return (
            <TouchableOpacity
                onPress={() => navigateTo(routeName)}
                //style={[{backgroundColor: this.state.backgroundColor}]} 
            >
                <LinearGradient
                    colors={['#57c1fb', '#1c84e5']}
                    style={styles.buttonContainer}
                >
                    <Icon
                        name='ios-add'
                        size={56}
                        style={styles.button}
                        color='#fff'
                    />
                </LinearGradient>
                
            </TouchableOpacity>
        );
    }
}

const styles = StyleSheet.create({
    buttonContainer: {
        width: 130,
        height: 130,
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 30    
    },
    button: {
        
    }
});