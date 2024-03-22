import { TextInput, Label, Button, Card } from 'flowbite-react'
import React, { useMemo, useState, useEffect } from 'react'
import CustomDataTable from '../../../components/CustomDataTable'
import AxiosClient from '../../../config/http-client/axios-client';
import RegisterUserForm from './components/RegisterUserForm';
import UpdateUserForm from './components/UpdateUserForm';
import { confirmAlert, customAlert } from '../../../config/alerts/alert';
import { TbUserCancel } from "react-icons/tb";
import { FaPen } from "react-icons/fa";

const UserPage = () => {

    const [selectedUser, setSelectedUser] = useState(null);
    const [loading, setLoading] = useState(false);
    const [filterText, setFilterText] = useState('');
    const [users, setUsers] = useState([]);
    const [isCreating, setIsCreating] = useState(false);
    const [isUpdate, setIsUpdate] = useState(false);

    const columns = useMemo(() => [
        {
            name: '#',
            cell: (row, i) => <>{i + 1}</>,
            selector: (row, i) => i,
            sortable: true,
        },
        {
            name: 'Usuario',
            cell: (row) => <>{row.username}</>,
            selector: (row) => row.username,
            sortable: true,
        },
        {
            name: 'Nombre completo',
            cell: (row) => <>{`${row.person.name} ${row.person.surname} ${row.person.lastname ?? ''} `}</>,
            selector: (row) => `${row.person.name} ${row.person.surname} ${row.person.lastname ?? ''} `,
            //Selector es la guia del sortable, sortable se usa para ordenar
            sortable: true,
        },
        {
            name: 'Estatus',
            cell: (row) => <>{row.status ? 'Activo' : 'Inactivo'}</>,
            selector: (row) => row.status,
            sortable: true,
        },
        {
            name: 'Acciones',
            cell: (row) => (
                <>
                    <Button
                        onClick={() => handleClickEdit(row)}
                    >
                        <FaPen size={"15px"} />
                    </Button>
                    <Button
                        onClick={() => changeStatus(row.id, row.status)}
                    >
                        <TbUserCancel size={"15px"} />
                    </Button>
                </>
            ),
        },
    ])
    //useMemo guarda como un cache para no renderizar varias veces

    const getUsers = async () => {
        try {
            const response = await AxiosClient({ url: "/user/", method: 'GET' });
            console.log(response);
            if (!response.error) setUsers(response.data);
        } catch (error) {
            console.log(error);
        } finally {
            setLoading(false);
        }
    }

    const changeStatus = async (id, statusUser) => {
        console.log(id, statusUser);
        confirmAlert(async () => {
            try {
                const response = await AxiosClient({
                    method: 'PATCH',
                    url: `user/${id}`,
                    data: {
                        status: !statusUser
                    }
                });
                if (!response.error) {
                    customAlert(
                        'Actualización exitosa',
                        'El estado del docente ha sido actualizado correctamente',
                        'success'
                    );
                    getUsers();
                }
            } catch (error) {
                customAlert(
                    'Error',
                    'Ha ocurrido un error, por favor intente de nuevo',
                    'error'
                );
            }
        });
    }

    const handleClickEdit = (user) => {
        setSelectedUser(user);
        setIsUpdate(true);
    };

    //useEffect se puede usar para que se ejecute una vez que toda nuestra pantalla se haya renderizado
    //Si no le mandamos nada al arreglo, solo se ejecutara una vez que todo se haya renderizado
    useEffect(() => {
        setLoading(true);
        getUsers();
    }, []); //Solo se ejecuta una vez al terminar de renderizar

    return (
        <section className='w-full px-4 pt-4 flex flex-col gap-4'>
            <h1 className='text-2xl'>Usuarios</h1>
            <div className='flex justify-between'>
                <div className='max-w-64'>
                    <Label htmlFor='' />
                    <TextInput type='text' id='filter' placeholder='Buscar...' />
                </div>
                <Button pill>AGREGAR</Button>
            </div>
            <Card>
                <CustomDataTable
                    columns={columns}
                    data={users}
                    isLoading={loading}
                />
            </Card>
            <Button
                outline
                color='success'
                pill
                onClick={() => setIsCreating(true)}
            >
            </Button>
            <RegisterUserForm
                isCreating={isCreating}
                setIsCreating={setIsCreating}
                getAllUsers={getUsers}
            />
            <UpdateUserForm isUpdate={isUpdate} setIsUpdate={setIsUpdate} getAllUsers={getUsers} selectedUser={selectedUser} />

        </section>
    )
}

export default UserPage