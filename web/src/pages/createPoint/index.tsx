import React, {useEffect, useState, ChangeEvent, FormEvent} from 'react';
import './styles.css';
import logo from '../../assets/logo.svg';
import { Link, useHistory} from 'react-router-dom';
import {FiArrowLeft} from 'react-icons/fi'
import {Map, TileLayer, Marker} from 'react-leaflet';
import api from '../../services/api';
import axios from 'axios';
import {LeafletMouseEvent} from 'leaflet'

interface Item {
    id: number;
    title: string;
    image_url: string;
}

interface IbgeResponse {
    sigla: string
}

interface IbgeCityResponse {
    nome: string
}

const CreatePoint = () => {

    const history = useHistory();
    const [items, setItems] = useState<Item[]>([]);
    const [ufs, setUfs] = useState<string[]>([]);
    const [selectedUf, setSelectdUf] = useState('0');
    const [cities, setCities] = useState<string[]>([]);
    const [selectedCity, setSelectedCity] = useState('0');
    const [mapPosition, setMapPosition] = useState<[number, number]>([0,0]);
    const [itinialMapPosition, setInitialMapPosition] = useState<[number, number]>([0,0]);
    const [selectedItems, setSelectedItems] = useState<number[]>([]);
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        whatsapp: ''
    })

    useEffect(() => {
        api.get('items').then(response => {
            setItems(response.data);
        });
    },[])


    useEffect(() => {
        axios.get<IbgeResponse[]>('https://servicodados.ibge.gov.br/api/v1/localidades/estados').then(response => {
            const uf = response.data.map(uf => uf.sigla);
            setUfs(uf);
        });
    },[]);

    useEffect(() => {
        
        if(selectedUf === '0') {
            return;
        }
        

        axios.get<IbgeCityResponse[]>(`https://servicodados.ibge.gov.br/api/v1/localidades/estados/${selectedUf}/municipios`)
        .then(response => {
            const cities = response.data.map(city => city.nome);
            setCities(cities);
        });
    },[selectedUf]);

    useEffect(() => {
        navigator.geolocation.getCurrentPosition(position => {
            const{latitude, longitude} = position.coords;
            setInitialMapPosition([latitude, longitude]);
        });
    }, []);

    function handleSelectUf(event: ChangeEvent<HTMLSelectElement>){
        const uf = event.target.value;
        setSelectdUf(uf);
    }

    function handleSelectCity(event: ChangeEvent<HTMLSelectElement>){
        const city = event.target.value;
        setSelectedCity(city);
    }

    function handleMouseEvent(event: LeafletMouseEvent){
        setMapPosition([event.latlng.lat, event.latlng.lng]);
    }

    function handleInputChange(event: ChangeEvent<HTMLInputElement>){
        const{name, value} = event.target;
        setFormData({...formData, [name]: value});
    }

    function handleSelectedItem(id: number){
        const alreadySelected = selectedItems.findIndex(item => item === id);
        
        if(alreadySelected >=0){
            const filteredItems = selectedItems.filter(item => item !== id);
            setSelectedItems(filteredItems);

        } else {
            setSelectedItems([...selectedItems, id]);
        }
    }

    async function handleSubmit(event: FormEvent){
        event.preventDefault();

        const {name, email, whatsapp} = formData;
        const uf = selectedUf;
        const city = selectedCity;
        const [latitude, longitude] = mapPosition;
        const items = selectedItems;

        const data = {
            name,
            email,
            whatsapp,
            uf,
            city,
            latitude,
            longitude,
            items
        };

        await api.post('points', data);

        alert('Ponto de coleta cadastrado com sucesso!');

        history.push('/');
    }

    return (
        <div id = "page-create-point">
            <header>
                <img src={logo} alt="Ecoleta"/>
                <Link to ="/">
                    <FiArrowLeft/>
                    Voltar para home
                </Link>
            </header>
            <form onSubmit={handleSubmit}>

                    <h1>Cadastro do <br/> ponto de coleta</h1>
                    <fieldset>
                        <legend>
                            <h2>Dados</h2>
                        </legend>

                            <div className="field">
                                <label htmlFor="name">Nome da entidade</label>
                                <input 
                                type="text"
                                name="name"
                                id="name"
                                onChange={handleInputChange}
                                />
                            </div>
                            <div className="field-group">
                                <div className="field">
                                    <label htmlFor="email">Email</label>
                                    <input 
                                    type="email"
                                    name="email"
                                    id="email"
                                    onChange={handleInputChange}
                                    />
                                </div>
                                <div className="field">
                                    <label htmlFor="whatsapp">whatsapp</label>
                                    <input 
                                    type="text"
                                    name="whatsapp"
                                    id="whatsapp"
                                    onChange={handleInputChange}
                                    />
                                </div>
                            </div>
                    </fieldset>

                    <fieldset>
                        <legend>
                            <h2>Endereço</h2>
                            <span>Selecione o endereço no mapa</span>
                        </legend>



                        <Map center={itinialMapPosition} zoom={15} onclick={handleMouseEvent}>
                            <TileLayer
                                attribution='&amp;copy <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
                                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                            />

                            <Marker position={mapPosition}/>
                        </Map>

                            



                            <div className="field-group">
                                <div className="field">
                                    <label htmlFor="uf">Estado</label>
                                    <select name="uf" id="uf" value={selectedUf} onChange={handleSelectUf}>
                                        <option value="0">SELECIONE UM ESTADO</option>
                                        {ufs.map(uf => (
                                            <option key={uf} value={uf}>{uf}</option>    
                                        ))}
                                    </select>
                                </div>

                                <div className="field">
                                    <label htmlFor="city">Cidade</label>
                                    <select name="city" id="city" value={selectedCity} onChange={handleSelectCity}>
                                        <option value="0">SELECIONE UMA CIDADE</option>
                                        {cities.map(city => (
                                           <option key={city} value={city}>{city}</option> 
                                        ))}
                                    </select>
                                </div>
                            </div>
                    </fieldset>
                    
                    <fieldset>
                        <legend>
                            <h2>Ítens de coleta</h2>
                            <span>Selecione os ítens de coleta</span>
                        </legend>
                        <ul className="items-grid">

                            {items.map(item => (
                                <li 
                                    key={item.id} 
                                    onClick={() => handleSelectedItem(item.id)}
                                    className={selectedItems.includes(item.id) ? 'selected' : ''}>
                    
                                    <img src={item.image_url} alt={item.title}/>
                                    <span>{item.title}</span>
                                </li>
                            ))}
                            
                          
                        </ul>
                    </fieldset>

                    <button type="submit">Cadastrar ponto de coleta</button>

                </form>
        </div>
    )
    ;
}

export default CreatePoint;