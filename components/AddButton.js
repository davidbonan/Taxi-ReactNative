import React from "react";
import { TouchableOpacity, StyleSheet} from "react-native";
import { Icon } from 'expo';

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
                style={[styles.buttonContainer, {backgroundColor: this.state.backgroundColor}]} 
            >
                <Icon.Ionicons
                    name='ios-add'
                    size={56}
                    style={styles.button}
                    color='#fff'
                />
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