import InputBox from '@/components/molecules/inputBox';
import MapLeaflet from '@/components/molecules/map-leaflet';
import InputBoxSearch from '@/components/ui/InputBoxSearch';
import ToggleSwitch from '@/components/ui/toggleSwitch';
import useAxiosForm from '@/hooks/useAxiosForm';
import { IErrorMessage } from '@/models/ErrorMessage';
import IBaseResponse from '@/models/IBaseResponse';
import { PharmacyDetail, logistics } from '@/models/Pharmacies';
import { INameAndId } from '@/models/Products';
import { IUser } from '@/models/Users';
import { AppDispatch } from '@/store';
import { showToastAsync } from '@/store/toast/toastSlice';
import { AddressParser, NameParser } from '@/utils/StringFormatter';
import { useEffect, useState } from 'react';
import useAuthUser from 'react-auth-kit/hooks/useAuthUser';
import { SubmitHandler, useForm } from 'react-hook-form';
import { useDispatch, useSelector } from 'react-redux';

interface ICreatePharmacies {
  name: string;
  address: string;
  province: string;
  city: string;
  district: string;
  subdistrict: string;
  latitude: number;
  longitude: number;
  partnerID: INameAndId;
  pharmacistID?: INameAndId;
  logisticPartners?: logistics;
  is_active: boolean;
}

interface PharmacyFormProps {
  existingData?: IBaseResponse<PharmacyDetail>;
  setModalAction: (value: boolean) => any;
}

const PharmacyForm: React.FC<PharmacyFormProps> = ({
  existingData,
  setModalAction,
}) => {
  // Loading state
  const dispatch = useDispatch<AppDispatch>();
  const [isActive, setIsActive] = useState(false);
  const [loadingState, setLoadingState] = useState(false);

  const user = useAuthUser<IUser>();

  const role = user?.role === 'admin' ? 'admin' : 'pharmacists';

  // React Hook Form setup with defaultValues
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setValue,
    getValues,
    watch,
  } = useForm<ICreatePharmacies>();

  const pharmacistID = watch('pharmacistID.id');

  const [partnerDisplay, setPartnerDisplay] = useState('');
  const [pharmacistDisplay, setPharmacistDisplay] = useState('');
  const [provinceDisplay, setProvinceDisplay] = useState('');
  const [cityDisplay, setCityDisplay] = useState('');
  const [districtDisplay, setDistrictDisplay] = useState('');
  const [subDistrictDisplay, setSubDistrictDisplay] = useState('');
  const [latitude, setLatitude] = useState(-6.2088);
  const [longitude, setLongitude] = useState(106.8456);

  useEffect(() => {
    if (existingData) {
      // Simulate a delay to mimic loading
      const timer = setTimeout(() => {
        const { data } = existingData;
        const parsed = AddressParser(data.address);
        const name = NameParser(data.name, parsed.address);
        setValue('name', name);
        setValue('address', parsed.address);
        setValue('city', data.city);
        setValue('district', parsed.district || '');
        setValue('subdistrict', parsed.subdistrict || '');
        setValue('latitude', data.latitude);
        setLatitude(data.latitude);
        setValue('longitude', data.longitude);
        setLongitude(data.longitude);
        setValue('partnerID', data.partner || '');
        setValue('pharmacistID', data.pharmacist || '');
        // setValue(
        //   'logisticPartners',
        //   data.logistics?.map((logistic) => logistic.id) || [],
        // );
        setValue('is_active', data.is_active || false);
        setLoadingState(false); // Data is now loaded
        setCityDisplay(data.city);
        setDistrictDisplay(parsed.district);
        setSubDistrictDisplay(parsed.subdistrict);
        setPartnerDisplay(data.partner.name);
        setPharmacistDisplay(data.pharmacist.name);
      }, 500); // 1 second delay for loading simulation

      return () => clearTimeout(timer); // Cleanup on unmount
    } else {
      // If no existingData, reset the form
      setLoadingState(false);
      setValue('name', '');
      setValue('address', '');
      setValue('city', '');
      setValue('district', '');
      setValue('subdistrict', '');
      setValue('latitude', latitude);
      setValue('longitude', longitude);
      setValue('partnerID.name', '');
      setValue('pharmacistID.name', '');
      setValue('is_active', false);
    }
  }, [existingData, setValue]);

  const handleSelect = (option: INameAndId) => {
    console.log('Selected option:', option);
  };

  const handleFieldState = (
    field: React.Dispatch<React.SetStateAction<string>>,
    value: string,
  ) => {
    field(value);
  };

  const [didSuccessCreatePharmacies, setDidSuccessCreatePharmacies] =
    useState(false);

  const { fetchData, loading } = useAxiosForm<ICreatePharmacies>({
    url: '/admin/pharmacies', // The API endpoint
  });

  const onSubmit: SubmitHandler<ICreatePharmacies> = async (d) => {
    // Prepare the body object
    const body = {
      name: d.name,
      address: d.address,
      city: d.city,
      latitude: Number(d.latitude),
      longitude: Number(d.longitude),
      partnerID: d.partnerID.id,
      pharmacistID: d.pharmacistID?.id,
      logisticPartners: Number(d.logisticPartners),
      isActive: d.is_active,
    };

    // Call fetchData from useAxiosForm
    await fetchData(body, (result: ICreatePharmacies | IErrorMessage) => {
      if ('message' in result) {
        // Handle error response
        const message = result.message;
        dispatch(showToastAsync({ message, type: 'warning' }));
      } else {
        // Handle success response
        setDidSuccessCreatePharmacies(true);
        console.log('Pharmacy created successfully');
      }
    });
  };

  if (loadingState) {
    return <div className="text-center">Loading...</div>; // Loading indicator
  }

  const handleClickSave = () => {};

  const handleMarkerDrag = (event: any) => {
    const { lat, lng } = event.target.getLatLng();
    console.log(lat, lng);
    setValue('latitude', lat);
    setValue('longitude', lng);
  };

  return (
    <div className="rounded-lg w-full px-10 pt-8">
      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col">
        <div className="flex flex-row flex-wrap justify-around">
          {/* Map Section */}
          <div className="min-w-[500px]">
            <div className="text-lg mt-4 font">Map</div>
            <div className="border-[1px] border-slate-200 w-full mb-4"></div>
            <div className="px-5 mb-4">
              <MapLeaflet
                latitude={String(latitude)}
                longitude={String(longitude)}
                zoom={16}
                height="50vh"
                width="100%"
                handleMarkerDrag={handleMarkerDrag}
              />
            </div>
          </div>

          <div className="min-w-[500px]">
            {/* Pharmacies Details */}
            <div className="text-lg mt-4 font">Pharmacies Details</div>
            <div className="border-[1px] border-slate-200 w-full mb-4"></div>

            <div className="flex flex-col px-5">
              {/* Input Fields */}
              <InputBox
                type="text"
                placeholder="Enter Pharmacies Name"
                label="Name"
                required
                error={errors.name}
                {...register('name', { required: 'Name is required' })}
              />
              <InputBox
                type="text"
                placeholder="Enter Address"
                label="Address"
                required
                error={errors.address}
                {...register('address', { required: 'Address is required' })}
              />

              <InputBoxSearch
                placeholder={'Enter Province'}
                apiEndpoint={'/clusters/provinces'}
                displayField="name"
                valueField="id"
                label="Province"
                onSelect={(item) => {
                  handleSelect(item);
                  handleFieldState(setProvinceDisplay, item.name);
                  setValue('province', item.name);
                }}
                required
              />

              <InputBoxSearch
                placeholder={'Enter City'}
                apiEndpoint={`/clusters/cities?province=${provinceDisplay}`}
                displayField="name"
                valueField="id"
                label="City"
                onSelect={(item) => {
                  handleSelect(item);
                  handleFieldState(setCityDisplay, item.name);
                  setValue('city', item.name);
                }}
                required
                defaultValue={cityDisplay}
              />
              <InputBoxSearch
                placeholder={'Enter District'}
                apiEndpoint={`/clusters/districts?city=${cityDisplay}&province=${provinceDisplay}`}
                displayField="name"
                valueField="id"
                label="District"
                onSelect={(item) => {
                  handleSelect(item);
                  handleFieldState(setDistrictDisplay, item.name);
                  setValue('district', item.name);
                }}
                required
                defaultValue={districtDisplay}
              />
              <InputBoxSearch
                placeholder={'Enter Subdistrict'}
                apiEndpoint={`/clusters/sub-districts?district=${districtDisplay}&city=${cityDisplay}&province=${provinceDisplay}`}
                displayField="name"
                valueField="id"
                label="Subdistrict"
                onSelect={(item) => {
                  handleSelect(item);
                  handleFieldState(setSubDistrictDisplay, item.name);
                  setValue('subdistrict', item.name);
                }}
                required
                defaultValue={subDistrictDisplay}
              />

              {role === 'admin' && (
                <>
                  {/* Partner */}
                  <InputBoxSearch
                    placeholder={'Enter Partner'}
                    apiEndpoint={`/admin/partners`}
                    displayField="name"
                    valueField="id"
                    label="Partner"
                    onSelect={(item) => {
                      handleSelect(item);
                      setValue('partnerID.id', item.id);
                    }}
                    defaultValue={partnerDisplay}
                  />

                  {role === 'admin' && (
                    <InputBoxSearch
                      placeholder={'Enter Pharmacist'}
                      apiEndpoint={`/admin/pharmacists`}
                      displayField="name"
                      valueField="id"
                      label="Pharmacist"
                      onSelect={(item) => {
                        handleSelect(item);
                        setValue('pharmacistID.id', item.id);
                      }}
                      defaultValue={pharmacistDisplay}
                    />
                  )}
                </>
              )}
            </div>

            {/* Isactive */}
            <div className="px-5 py-3 flex flex-row w-[60%] items-center justify-between">
              <label className="mr-2 w-[30%]">Status :</label>
              <ToggleSwitch
                checked={isActive}
                onChange={(e) => {
                  setIsActive(e.target.checked);
                  setValue('is_active', e.target.checked);
                }} // Handle toggle state
                disabled={!pharmacistID}
              />
            </div>
          </div>
        </div>

        {/* Bottom Buttons */}
        <div className="w-full flex justify-between gap-5 mt-12 mb-8">
          <button
            type="button"
            className="pessimist-btn-2 w-[50%]"
            onClick={() => {
              dispatch(setModalAction(false));
            }}
          >
            CANCEL
          </button>
          <button
            disabled={isSubmitting}
            className="cta-btn-1 w-[50%]"
            onClick={() => {
              handleClickSave();
              const formData = getValues(); // Get the current form values
              console.log('form data:', formData, formData.pharmacistID?.id);
            }}
          >
            SAVE
          </button>
        </div>
      </form>
    </div>
  );
};

export default PharmacyForm;
