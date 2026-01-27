import React, { useState, useEffect } from 'react';
import { classNames } from 'primereact/utils';
import { FilterMatchMode } from 'primereact/api';
import { DataTable, DataTableFilterMeta } from 'primereact/datatable';
import { Column, ColumnFilterElementTemplateOptions } from 'primereact/column';
import { InputText } from 'primereact/inputtext';
import { Dropdown, DropdownChangeEvent } from 'primereact/dropdown';
import { MultiSelect, MultiSelectChangeEvent } from 'primereact/multiselect';
import { Tag } from 'primereact/tag';
import { TriStateCheckbox, TriStateCheckboxChangeEvent } from 'primereact/tristatecheckbox';
import { CustomerService } from './service/CustomeService';
import { TablaComponenteCRUD, TablaCRUD } from '../../shared/components/Tabla';


const MESES = ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"];

const statuses = ['unqualified', 'qualified', 'new', 'negotiation', 'renewal'];
const representatives = [
    { name: 'Amy Elsner', image: 'amyelsner.png' },
    { name: 'Anna Fali', image: 'annafali.png' },
    { name: 'Asiya Javayant', image: 'asiyajavayant.png' },
    { name: 'Bernardo Dominic', image: 'bernardodominic.png' },
    { name: 'Elwin Sharvill', image: 'elwinsharvill.png' },
    { name: 'Ioni Bowcher', image: 'ionibowcher.png' },
    { name: 'Ivan Magalhaes', image: 'ivanmagalhaes.png' },
    { name: 'Onyama Limba', image: 'onyamalimba.png' },
    { name: 'Stephen Shaw', image: 'stephenshaw.png' },
    { name: 'XuXue Feng', image: 'xuxuefeng.png' }
];


interface Representative {
  name: string;
  image: string;
}

interface Country {
    name: string;
    code: string;
}

interface Customer {
  id: number;
  name: string;
  country: Country;
  company: string;
  date: string;
  status: string;
  verified: boolean;
  activity: number;
  representative: Representative;
  balance: number;
}

export const Tabla = () => {
    const [customers, setCustomers] = useState<Customer[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    
    //? Get & Set data
    useEffect(() => {
        CustomerService.getCustomersMedium().then((data: Customer[]) => {
            // // setCustomers(getCustomers(data));    //? getCustomers era una funcion que tomaba la data y a cada input le añadía d.date = new Date(d.date);
            setCustomers(data);
            setLoading(false);
        });
    }, []); 


    const [globalFilterValue, setGlobalFilterValue] = useState<string>('');
    //ToDo: Que hace?
    const [filters, setFilters] = useState<DataTableFilterMeta>({
        global: { value: null, matchMode: FilterMatchMode.CONTAINS },

        name:       { value: null, matchMode: FilterMatchMode.STARTS_WITH },
        'country.name': { value: null, matchMode: FilterMatchMode.STARTS_WITH },
        representative: { value: null, matchMode: FilterMatchMode.IN },
        status:     { value: null, matchMode: FilterMatchMode.EQUALS },
        verified:   { value: null, matchMode: FilterMatchMode.EQUALS }
    });

    const onGlobalFilterChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        let _filters = { ...filters };

        // @ts-ignore
        _filters['global'].value = value;

        setFilters(_filters);
        setGlobalFilterValue(value);
    };
    //ToDo: Que hace?   --FIN


    //? Header de la tabla
    const header = () => {
        return (
        <div className="flex justify-content-end">
            <InputText value={globalFilterValue} onChange={onGlobalFilterChange}  placeholder="Search" />
        </div>
        );
    };

    //? Usado en el filter input de status (statusRowFilterTemplate)
    const getSeverity = (status: string) => {
        switch (status) {
            case 'unqualified':
                return 'danger';

            case 'qualified':
                return 'success';

            case 'new':
                return 'info';

            case 'negotiation':
                return 'warning';

            case 'renewal':
                return null;
        }
    };

    //? filter input de Agent
    const representativeRowFilterTemplate = (options: ColumnFilterElementTemplateOptions) => {
        return (
            <MultiSelect
                optionLabel="name"
                value={options.value}
                options={representatives}
                // itemTemplate={representativesItemTemplate}
                // // name='name'
                onChange={(e: MultiSelectChangeEvent) => options.filterApplyCallback(e.value)}
                placeholder="Select"
                className="p-column-filter"
                maxSelectedLabels={1}
                style={{ minWidth: '14rem' }}
            />
        );
    };

    //? filter input de status
    const statusRowFilterTemplate = (options: ColumnFilterElementTemplateOptions) => {
        return (
            <Dropdown 
                value={options.value} 
                options={statuses} 
                onChange={(e: DropdownChangeEvent) => options.filterApplyCallback(e.value)} 
                itemTemplate={ (option: string) => <Tag value={option} severity={getSeverity(option)} /> } 
                placeholder="Select One" 
                className="p-column-filter" 
                showClear 
                style={{ minWidth: '12rem' }} 
            />
        );
    };

    //? filter input de verified
    const verifiedRowFilterTemplate = (options: ColumnFilterElementTemplateOptions) => {
        return <TriStateCheckbox value={options.value} onChange={(e: TriStateCheckboxChangeEvent) => options.filterApplyCallback(e.value)} />;
    };


    return (
        <div className="card">
            <DataTable 
                value={customers} 
                header={ header } 
                paginator rows={10} 
                dataKey="id" 
                emptyMessage="No customers found."
                loading={loading}   

                filters={filters} 
                    filterDisplay="row" 
                    globalFilterFields={['name', 'country.name', 'representative.name', 'status']} 
            >
                <Column 
                    field='name' 
                    header="Name" 
                    style={{ minWidth: '12rem' }} 
                    filter filterPlaceholder="Search by name" 
                />
                <Column 
                    field='country.name'
                    header="Country" 
                    style={{ minWidth: '12rem' }} 
                    filter filterField="country.name" filterPlaceholder="Search by country"
                />
                <Column
                    field='representative.name' 
                    header="Agent" 
                    style={{ minWidth: '14rem' }} 

                    filter 
                        filterField="representative" 
                        filterElement={representativeRowFilterTemplate} //? Usar un MultiSelect como input
                        showFilterMenu={false}  //? Boton de tipo de filtro
                        // filterMenuStyle={{ width: '10rem' }} 
                />
                <Column 
                    field="status" 
                    header="Status" 
                    style={{ minWidth: '12rem' }} 
                    filter 
                        showFilterMenu={false}  //? Boton de tipo de filtro
                        filterElement={statusRowFilterTemplate}         //? Usar un Select (Dropdown) como input
                        // filterMenuStyle={{ width: '14rem' }} 
                />
                <Column 
                    field="verified" 
                    header="Verified" 
                    style={{ minWidth: '6rem' }} 
                    dataType="boolean" 
                    body={(rowData: Customer) => rowData.verified ? '✅':'❌'}  //? mostar un icono en lugar del valor booleano
                    filter 
                    filterElement={verifiedRowFilterTemplate}           //? Usar un checkBox
                />
            </DataTable>

            <TablaCRUD 
                data={customers} 
                cols={[
                    {field:'name', header: 'Name' },
                    {field:'country.name', header:"Country", align: 'center', filter:true },
                    {field:'representative.name', header:"Agente", filter: true, filterPlaceholder: '...'},
                    {field:'status', header:"Status", filter: true, filterPlaceholder: '...' },
                    {field:'verified', header:"Verified", align: 'left', dataType:"boolean", body: (rowData: Customer) => rowData.verified ? '✅':'❌' },
                ]}
                docTitle={`Prueba 1 - ${MESES[new Date().getMonth()]}`}
                accion={false}
            />            
        </div>
    );
}