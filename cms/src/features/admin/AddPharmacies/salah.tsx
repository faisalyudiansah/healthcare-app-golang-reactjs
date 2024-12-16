// import { RxCross1 } from 'react-icons/rx';
// import { useDispatch, useSelector } from 'react-redux';
// import { AppDispatch } from '@/store';
// import { setShowCreatePharmaciesModal } from '@/store/modals/modalsSlice';
// import { SubmitHandler, useForm } from 'react-hook-form';
// import { ReactNode, useEffect, useState } from 'react';
// import axios, { AxiosError } from 'axios';
// import { showToastAsync } from '@/store/toast/toastSlice';
// import { useNavigate } from 'react-router-dom';
// import { ConvertActiveStatus } from '@/utils/StringFormatter';
// import ToggleSwitch from '@/components/ui/toggleSwitch';
// import FVPFilterSearcher from '@/components/ui/FVPFilterSearcher';
// import FilterCapsule from '../Products/FilterCapsule';
// import { getFilterParams } from '@/store/filterProduct/filterProductsSlice';
// import FVPSearcher from '@/components/ui/FVPSearcher';
// import SelectSearch, {
//   SearchEntity,
//   initialState,
// } from '@/components/ui/selectSearch';
// import InputBox from '@/components/molecules/inputBox';

// interface ICreatePharmacies {
//   name: string;
//   address: string;
//   city: string;
//   district: string;
//   subdistrict: string;
//   pharmacistID: number;
//   latitude: number;
//   longitude: number;
//   partnerID: number;
//   logisticPartners: number;
// }

// const AddPharmacies_salah = () => {
//   const dispatch = useDispatch<AppDispatch>();
//   const navigate = useNavigate();
//   const getCurrFilterParams = useSelector(getFilterParams);

//   const [is_active, setIsActive] = useState(false);
//   const [showManuErr, setShowManuErr] = useState(false);
//   const [searchPartnerID, setPartnerID] = useState<SearchEntity>(initialState);
//   const [searchPharmacistID, setPharmacistID] =
//     useState<SearchEntity>(initialState);

//   const [thisState, setThisState] = useState<{
//     loading: boolean;
//     data: string;
//     error: string;
//   }>({
//     loading: false,
//     data: '',
//     error: '',
//   });

//   const [didSuccessCreatePharmacies, setDidSuccessCreatePharmacies] =
//     useState(false);

//   const {
//     register,
//     formState: { errors, isSubmitting },
//     handleSubmit,
//     getValues,
//     watch,
//   } = useForm<ICreatePharmacies>({ mode: 'onBlur' });

//   const onSubmit = (data: any) => {
//     console.log(data);
//   };

//   // const onSubmit: SubmitHandler<ICreatePharmacies> = async (d) => {
//   //   setThisState((prev) => ({ ...prev, loading: true }));
//   //   await axios
//   //     .post('/admin/pharmacies', {
//   //       name: d.name,
//   //       address: d.address,
//   //       city: d.city,
//   //       latitude: Number(d.latitude),
//   //       longitude: Number(d.longitude),
//   //       partnerID: searchPartnerID,
//   //       pharmacistID: searchPharmacistID,
//   //       logisticPartners: Number(d.logisticPartners),
//   //       isActive: is_active,
//   //     })
//   //     .then(() => setDidSuccessCreatePharmacies(true))
//   //     .catch((e: AxiosError<{ message: string }>) => {
//   //       const message = e.response?.data.message ?? 'Failed to get message';
//   //       dispatch(showToastAsync({ message, type: 'warning' }));
//   //     })
//   //     .finally(() => {
//   //       setThisState((prev) => ({ ...prev, loading: false }));
//   //     });
//   // };

//   let content: ReactNode;
//   if (!didSuccessCreatePharmacies) {
//     content = (
//       <div className=" rounded-lg w-full px-10 pt-8">
//         {/* MARK: WHOLE FORM */}

//         <form onSubmit={handleSubmit(onSubmit)}>
//           {/* BREAK LINE */}
//           <div className="text-lg font mt-10">Pharmacies Details</div>
//           <div className="border-[1px] border-slate-200 w-full mt-1 mb-4"></div>
//           <InputBox
//             type="text"
//             placeholder="Enter your name"
//             label="Name"
//             required
//             // errors={errors}
//             name="name"
//             // ref={register({ required: true })} // Validation rule for required input
//           />
//           {/* MARK: NAME */}
//           {errors.name && (
//             <div className="absolute ml-1 mb-1 text-invalid-field">
//               Name is required
//             </div>
//           )}
//           <label
//             htmlFor="p-name"
//             className="relative flex flex-col justify-start items-start font-medium text-slate-600"
//           >
//             <div>
//               Name <span className="text-red-600">*</span>
//             </div>

//             <input
//               {...register('name', {
//                 required: true,
//               })}
//               type="text"
//               id="p-name"
//               placeholder="Enter pharmacies name"
//               className="border-2 border-slate-300 focus:outline-[#196157] rounded-md pl-2 h-10 w-[60%] mt-1 font-normal"
//             />
//           </label>
//           {errors.name && (
//             <div className="absolute ml-1 mb-1 text-invalid-field">
//               Name is required
//             </div>
//           )}
//           {/* MARK: CITY */}
//           <label
//             htmlFor="p-city"
//             className="relative flex flex-col justify-start items-start font-medium text-slate-600 mt-6"
//           >
//             <div>
//               City <span className="text-red-600">*</span>
//             </div>

//             <input
//               {...register('city', {
//                 required: true,
//               })}
//               type="text    "
//               id="p-city"
//               placeholder="Enter City"
//               className="border-2 border-slate-300 focus:outline-[#196157] rounded-md pl-2 h-10 w-[60%] mt-1 font-normal"
//             />
//           </label>
//           {errors.city && (
//             <div className="absolute ml-1 mb-1 text-invalid-field">
//               City is required
//             </div>
//           )}
//           {/* MARK: DISTRICT */}
//           <label
//             htmlFor="p-district"
//             className="relative flex flex-col justify-start items-start font-medium text-slate-600 mt-6"
//           >
//             <div>
//               District <span className="text-red-600">*</span>
//             </div>

//             <input
//               {...register('district', {
//                 required: true,
//               })}
//               type="text    "
//               id="p-district"
//               placeholder="Enter District"
//               className="border-2 border-slate-300 focus:outline-[#196157] rounded-md pl-2 h-10 w-[60%] mt-1 font-normal"
//             />
//           </label>
//           {errors.district && (
//             <div className="absolute ml-1 mb-1 text-invalid-field">
//               District is required
//             </div>
//           )}
//           {/* MARK: SUBDISTRICT */}
//           <label
//             htmlFor="p-subdistrict"
//             className="relative flex flex-col justify-start items-start font-medium text-slate-600 mt-6"
//           >
//             <div>
//               Subdistrict <span className="text-red-600">*</span>
//             </div>

//             <input
//               {...register('subdistrict', {
//                 required: true,
//               })}
//               type="text    "
//               id="p-subdistrict"
//               placeholder="Enter Subdistrict"
//               className="border-2 border-slate-300 focus:outline-[#196157] rounded-md pl-2 h-10 w-[60%] mt-1 font-normal"
//             />
//           </label>
//           {errors.subdistrict && (
//             <div className="absolute ml-1 mb-1 text-invalid-field">
//               Subdistrict is required
//             </div>
//           )}
//           {/* MARK: ADDRESS */}
//           <label
//             htmlFor="p-address"
//             className="relative flex flex-col justify-start items-start font-medium text-slate-600 mt-6"
//           >
//             <div>
//               Address <span className="text-red-600">*</span>
//             </div>

//             <input
//               {...register('address', {
//                 required: true,
//               })}
//               type="text    "
//               id="p-address"
//               placeholder="Enter Address"
//               className="border-2 border-slate-300 focus:outline-[#196157] rounded-md pl-2 h-10 w-[60%] mt-1 font-normal"
//             />
//           </label>
//           {errors.address && (
//             <div className="absolute ml-1 mb-1 text-invalid-field">
//               Address is required
//             </div>
//           )}
//           {/* MARK: LATITUDE */}
//           <label
//             htmlFor="p-latitude"
//             className="relative flex flex-col justify-start items-start font-medium text-slate-600 mt-6"
//           >
//             <div>
//               Latitude <span className="text-red-600">*</span>
//             </div>

//             <input
//               {...register('latitude', {
//                 required: true,
//               })}
//               type="text    "
//               id="p-latitude"
//               placeholder="Enter Latitude"
//               className="border-2 border-slate-300 focus:outline-[#196157] rounded-md pl-2 h-10 w-[60%] mt-1 font-normal"
//             />
//           </label>
//           {errors.latitude && (
//             <div className="absolute ml-1 mb-1 text-invalid-field">
//               Latitude is required
//             </div>
//           )}
//           {/* MARK: LONGITUDE */}
//           <label
//             htmlFor="p-longitude"
//             className="relative flex flex-col justify-start items-start font-medium text-slate-600 mt-6"
//           >
//             <div>
//               Longitude <span className="text-red-600">*</span>
//             </div>

//             <input
//               {...register('longitude', {
//                 required: true,
//               })}
//               type="text    "
//               id="p-longitude"
//               placeholder="Enter Longitude"
//               className="border-2 border-slate-300 focus:outline-[#196157] rounded-md pl-2 h-10 w-[60%] mt-1 font-normal"
//             />
//           </label>
//           {errors.longitude && (
//             <div className="absolute ml-1 mb-1 text-invalid-field">
//               Longitude is required
//             </div>
//           )}
//           {/* BREAK LINE */}
//           <div className="text-lg font mt-10">Partner</div>
//           <div className="border-[1px] border-slate-200 w-full mt-1 mb-4"></div>
//           {/* MARK: PARTNER */}
//           <label
//             htmlFor="p-partner"
//             className="relative flex flex-col justify-start items-start font-medium text-slate-600"
//           >
//             <div className="flex flex-row w-[60%] items-center justify-between">
//               <label className="mr-2 w-[40%]">
//                 Partner <span className="text-red-600">*</span> :
//               </label>
//               {/* <input
//                 {...register('partnerID', {
//                   required: true,
//                 })}
//                 type="text"
//                 id="p-partner"
//                 placeholder="Enter partner"
//                 className="border-2 border-slate-300 focus:outline-[#196157] rounded-md pl-2 h-10 w-[70%] mt-1 font-normal"
//               /> */}

//               <SelectSearch<ICreatePharmacies>
//                 endpoint="admin/partners"
//                 placeholder="Enter Partner"
//                 formHook={{
//                   label: 'partnerID',
//                   register,
//                   errors,
//                   watch,
//                 }}
//                 showErrorCallback={setShowManuErr}
//                 withErrorStyle={showManuErr}
//                 setData={setPartnerID}
//               />
//             </div>
//           </label>
//           {errors.partnerID && (
//             <div className="absolute ml-1 mb-1 text-invalid-field">
//               Partner is required
//             </div>
//           )}
//           {/* BREAK LINE */}
//           <div className="text-lg font mt-10">Pharmacist</div>
//           <div className="border-[1px] border-slate-200 w-full mt-1 mb-4"></div>
//           {/* MARK: PHARMACIST */}
//           <label
//             htmlFor="p-pharmacist"
//             className="relative flex flex-col justify-start items-start font-medium text-slate-600"
//           >
//             <div className="flex flex-row w-[60%] items-center justify-between">
//               <label className="mr-2 w-[40%]">Pharmacist :</label>
//               {/* <input
//                 {...register('pharmacistID', {
//                   required: true,
//                 })}
//                 type="text"
//                 id="p-pharmacist"
//                 placeholder="Enter pharmacist"
//                 className="border-2 border-slate-300 focus:outline-[#196157] rounded-md pl-2 h-10 w-[70%] mt-1 font-normal"
//               /> */}
//               <SelectSearch<ICreatePharmacies>
//                 endpoint="admin/pharmacists"
//                 placeholder="Enter Partner"
//                 formHook={{
//                   label: 'pharmacistID',
//                   register,
//                   errors,
//                   watch,
//                 }}
//                 nameFilter={true}
//                 showErrorCallback={setShowManuErr}
//                 withErrorStyle={showManuErr}
//                 setData={setPharmacistID}
//               />
//             </div>
//           </label>
//           {errors.pharmacistID && (
//             <div className="absolute ml-1 mb-1 text-invalid-field">
//               Pharmacist is required, buat awal (nanti diapus)
//             </div>
//           )}
//           {/* BREAK LINE */}
//           <div className="text-lg font mt-10">Status</div>
//           <div className="border-[1px] border-slate-200 w-full mt-1 mb-4"></div>
//           {/* MARK: ISACTIVE */}
//           <div className="flex flex-row w-[60%] items-center justify-between">
//             <label className="mr-2 w-[30%]">Status :</label>
//             <ToggleSwitch
//               checked={is_active}
//               onChange={(e) => setIsActive(e.target.checked)}
//               disabled={!searchPharmacistID.id}
//             />
//           </div>
//           <button
//             onClick={() =>
//               console.log({
//                 partner: searchPartnerID.id,
//                 pharmacistID: searchPharmacistID.id,
//               })
//             }
//           >
//             pencet sini bro {getValues('name')}
//           </button>
//           {/* BOTTOM BUTTONS */}
//           <div className="w-full flex justify-between gap-5 mt-12 mb-8">
//             <button
//               type="button"
//               className="pessimist-btn-2 w-[50%]"
//               onClick={() => dispatch(setShowCreatePharmaciesModal(false))}
//             >
//               CANCEL
//             </button>
//             <button
//               // disabled={thisState.loading}
//               disabled={isSubmitting}
//               className="cta-btn-1 w-[50%]"
//             >
//               SAVE
//             </button>
//           </div>
//         </form>
//       </div>
//     );
//   } else {
//     content = (
//       <div className="flex flex-col justify-start items-start w-full px-24 mt-8">
//         <div className="text-2xl font-medium self-center">Success</div>
//         <div className="text-slate-500 self-center">
//           Successfully registered a new Pharmacies
//         </div>

//         <div className="flex flex-col justify-start items-start mt-8 ">
//           <div className="text-slate-700 font-semibold">name</div>
//           <div>{getValues('name')}</div>

//           <div className="text-slate-700 font-semibold mt-6">address</div>
//           <div>{getValues('address')}</div>

//           <div className="text-slate-700 font-semibold mt-6">city</div>
//           <div>{getValues('city')}</div>

//           <div className="text-slate-700 font-semibold mt-6">partner</div>
//           <div>{getValues('partnerID')}</div>

//           <div className="text-slate-700 font-semibold mt-6">pharmacist</div>
//           <div>{getValues('pharmacistID')}</div>
//         </div>

//         <button
//           className="cta-btn-2 self-center mt-10 mb-8"
//           onClick={() => {
//             dispatch(setShowCreatePharmaciesModal(false));
//             navigate(0);
//           }}
//         >
//           See Pharmacies List
//         </button>
//       </div>
//     );
//   }

//   return (
//     <div
//       className={`relative bg-white  ${
//         !didSuccessCreatePharmacies ? 'w-[750px] h-[90%]' : 'h-fit'
//       } max-h-[840px] overflow-y-scroll pt-10 flex flex-col justify-start items-center rounded-xl`}
//     >
//       {!didSuccessCreatePharmacies && (
//         <div className="text-2xl font-medium  self-center">
//           Create Pharmacies
//         </div>
//       )}

//       {/* CLOSE BTN */}
//       <div
//         className="absolute right-4 top-4 cursor-pointer"
//         onClick={() => dispatch(setShowCreatePharmaciesModal(false))}
//       >
//         <RxCross1 className="size-7 text-slate-500" />
//       </div>

//       {content}
//     </div>
//   );
// };

// export default AddPharmacies_salah;
