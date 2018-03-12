import React, {Component, Fragment} from 'react';
import Burger from '../../components/Burger/Burger';
import BuildControls from '../../components/Burger/BuildControls/BuildControls';
import Modal from '../../components/UI/Modal/Modal';
import OrderSummary from '../../components/Burger/OrderSummary/OrderSummary';
import axios from '../../axios-orders';
import Spinner from '../../components/UI/Spinner/Spinner';
import withErrorHandler from '../../hoc/withErrorHandler/withErrorHandler';

const INGREDIENT_PRICES = {
    salad: 0.5,
    cheese: 0.4,
    meat: 1.3,
    bacon: 0.7
};

class BurgerBuilder extends Component {
    state = {
        ingredients: null,
        totalPrice: 4,
        atLeastOneIngredient: false,
        orderButtonClicked: false,
        loading: false,
        error: null
    };

    componentDidMount() {
        axios.get('https://react-burger-builder-8a4dd.firebaseio.com/ingredients.json')
            .then(response => {
                this.setState({ingredients: response.data});
            })
            .catch(error => {
                this.setState({error: true});
            });
    };

    updateAtLeastOneIngredient(ingredients) {
        const sum = Object.keys(ingredients).map(igKey => {
            return ingredients[igKey];
        }).reduce((sum, el) => {
            return sum + el;
        }, 0);

        this.setState({atLeastOneIngredient: sum > 0});
    }

    addIngredientHandler = (type) => {
        const oldCount = this.state.ingredients[type];
        const updatedCount = oldCount + 1;
        const updatedIngredients = {
            ...this.state.ingredients
        };
        updatedIngredients[type] = updatedCount;
        const priceAddition = INGREDIENT_PRICES[type];
        const oldPrice = this.state.totalPrice;
        const newPrice = oldPrice + priceAddition;
        this.setState({
            totalPrice: newPrice,
            ingredients: updatedIngredients,
            atLeastOneIngredient: true
        })
    };

    removeIngredientHandler = (type) => {
        const oldCount = this.state.ingredients[type];
        const updatedCount = oldCount - 1;
        const updatedIngredients = {
            ...this.state.ingredients
        };
        updatedIngredients[type] = updatedCount;
        const priceReduction = INGREDIENT_PRICES[type];
        const oldPrice = this.state.totalPrice;
        const newPrice = oldPrice - priceReduction;
        this.updateAtLeastOneIngredient(updatedIngredients);
        this.setState({
            totalPrice: newPrice,
            ingredients: updatedIngredients
        })
    };

    orderButtonClickedHandler = () => {
        this.setState({orderButtonClicked: true});
    };

    orderCanceledHandler = () => {
        this.setState({orderButtonClicked: false});
    };

    orderContinuedHandler = () => {
        // alert('continued');
        this.setState({loading: true});
        const order = {
            ingredients: this.state.ingredients,
            price: this.state.totalPrice,
            customer: {
                name: 'Steve Short',
                address: {
                    street: '4406 125th St',
                    zipCode: '50323',
                    state: 'IA'
                },
                email: 'test@test.com'
            },
            deliveryMethod: 'fastest'
        };
        axios.post('/orders.json', order)
            .then(response => {
                console.log(response);
                this.setState({loading: false, orderButtonClicked: false});
            })
            .catch(error => {
                console.log(error);
                this.setState({loading: false, orderButtonClicked: false});
            });
    };

    render() {
        const disabledInfo = {
            ...this.state.ingredients
        };
        for (let key in disabledInfo) {
            disabledInfo[key] = disabledInfo[key] <= 0;
        }

        let burger = this.state.error ? <p>Ingredients can't be loaded.</p> : <Spinner/>;
        let orderSummary = null;
        if (this.state.ingredients) {
            burger = (
                <Fragment>
                    <Burger ingredients={this.state.ingredients}/>
                    <BuildControls
                        ingredientAdded={this.addIngredientHandler}
                        ingredientRemoved={this.removeIngredientHandler}
                        disabled={disabledInfo}
                        orderNowEnabled={this.state.atLeastOneIngredient}
                        price={this.state.totalPrice}
                        ordered={this.orderButtonClickedHandler}
                    />
                </Fragment>);
            orderSummary = <OrderSummary
                ingredients={this.state.ingredients}
                price={this.state.totalPrice}
                orderCanceled={this.orderCanceledHandler}
                orderContinued={this.orderContinuedHandler}
            />;
        }
        if (this.state.loading) {
            orderSummary = <Spinner/>
        }

        return (
            <Fragment>
                <Modal show={this.state.orderButtonClicked} modalClosed={this.orderCanceledHandler}>
                    {orderSummary}
                </Modal>
                {burger}
            </Fragment>
        );
    }
}

export default withErrorHandler(BurgerBuilder, axios);