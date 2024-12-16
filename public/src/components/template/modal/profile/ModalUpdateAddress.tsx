import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useCookies } from "react-cookie";
import { AppDispatch, RootState } from "@/stores";
import { useDispatch, useSelector } from "react-redux";
import { putUpdateAddress } from "@/stores/slices/addressSlices/addressSlice";
import { getMe } from "@/stores/slices/authSlices/authSlice";
import { useCallback, useEffect, useRef, useState } from "react";
import MapLeaflet from "@/components/ui/map-leaflet";
import { getCity, getDistrict, getProvince, getSubDistrict } from "@/stores/slices/addressSlices/clusterSlice";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Input } from "@/components/ui/input";
import { Address } from "@/@types/profile/response";
import { Textarea } from "@/components/ui/textarea";

const phoneRegex = /^(?:\+62|0)8[1-9][0-9]{7,11}$/;

const FormSchema = z.object({
  province: z.string({
    required_error: "Please select province.",
  }).min(1, { message: "Please select province." }),

  city: z.string({
    required_error: "Please select city.",
  }).min(1, { message: "Please select city." }),

  district: z.string({
    required_error: "Please select district.",
  }).min(1, { message: "Please select district." }),

  sub_district: z.string({
    required_error: "Please select sub district.",
  }).min(1, { message: "Please select sub district." }),

  contact_name: z.string({
    required_error: "Contact Name is required.",
  }).min(1, { message: "Contact Name is required." }),

  contact_phone_number: z.string({
    required_error: "Phone number is required.",
  })
    .min(1, { message: "Phone number is required." })
    .regex(phoneRegex, { message: "Invalid phone number format." }),

  address: z.string({
    required_error: "Address is required.",
  }).min(1, { message: "Address is required." }),
});

function ModalUpdateAddress({ dataAddress }: { dataAddress: Address }) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const dispatch = useDispatch<AppDispatch>();
  const [cookies] = useCookies(['access_token']);
  const [dataBody, setDataBody] = useState({
    contact_name: dataAddress.contact_name,
    contact_phone_number: dataAddress.contact_phone_number,
    address: dataAddress.address,
    province: dataAddress.province,
    city: dataAddress.city,
    city_id: dataAddress.city_id,
    district: dataAddress.district,
    sub_district: dataAddress.sub_district,
    latitude: dataAddress.latitude || "-6.2088",
    longitude: dataAddress.longitude || "106.8456",
  });
  const [isModalOpen, setIsModalOpen] = useState(false);
  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues: dataBody,
  });
  const [isLoading, setIsLoading] = useState(true);
  const { isUpdateAddressError, isUpdateAddressLoading } = useSelector((state: RootState) => state.addressReducer);
  const {
    dataProvinceCluster,
    dataCityCluster,
    dataDistrictCluster,
    isDataDistrictLoading,
    dataSubDistrictCluster,
  } = useSelector((state: RootState) => state.clusterReducer);
  const [districtPage, setDistrictPage] = useState(1);

  const handleMarkerDrag = (event: any) => {
    const { lat, lng } = event.target.getLatLng();
    setDataBody((prev) => ({
      ...prev,
      latitude: lat.toString(),
      longitude: lng.toString(),
    }));
  };

  const saveUpdateAddress = form.handleSubmit(async (data) => {
    setDataBody({
      ...dataBody,
      ...data,
    });

    try {
      await dispatch(putUpdateAddress(cookies.access_token, dataAddress.id, dataBody));
      if (!isUpdateAddressError) {
        setDataBody({
          ...dataBody,
          city: "",
          city_id: 0,
          district: "",
          sub_district: "",
          province: "",
        })
        form.setValue('city', "");
        form.setValue('district', "");
        form.setValue('sub_district', "");
        form.setValue('province', "");
        dispatch(getMe(cookies.access_token));
        setIsModalOpen(false);
      }
    } catch (error) {
      console.log(error);
    }
  });


  useEffect(() => {
    if (isModalOpen) {
      dispatch(getProvince(cookies.access_token, 10, 1, false));
    }
  }, [isModalOpen]);

  useEffect(() => {
    if (dataAddress && isModalOpen) {
      setDataBody({
        contact_name: dataAddress.contact_name,
        contact_phone_number: dataAddress.contact_phone_number,
        address: dataAddress.address,
        province: dataAddress.province,
        city: dataAddress.city,
        city_id: dataAddress.city_id,
        district: dataAddress.district,
        sub_district: dataAddress.sub_district,
        latitude: dataAddress.latitude || "-6.2088",
        longitude: dataAddress.longitude || "106.8456",
      });
      // form.setValue('province',"");
      // form.setValue('city', "");
      // form.setValue('district', "");
      // form.setValue('sub_district', "");
      setIsLoading(false);
    }
  }, [dataAddress, isModalOpen]);


  useEffect(() => {
    if (isModalOpen && dataBody.province !== "") {
      dispatch(getCity(cookies.access_token, 10, 1, dataBody.province, false));
    }
  }, [dataBody.province, isModalOpen]);

  useEffect(() => {
    if (isModalOpen && dataBody.city !== "") {
      dispatch(getDistrict(cookies.access_token, 10, 1, dataBody.province, dataBody.city, false));

    }
  }, [dataBody.city, isModalOpen]);

  useEffect(() => {
    if (isModalOpen && dataBody.district !== "") {
      dispatch(getSubDistrict(cookies.access_token, 10, 1, dataBody.province, dataBody.city, dataBody.district, false));
    }
  }, [dataBody.district, isModalOpen]);

  useEffect(() => {
    if (dataBody.city !== "" && districtPage > 1) {
      dispatch(getDistrict(cookies.access_token, 10, districtPage, dataBody.province, dataBody.city, true));
    }
  }, [districtPage]);

  const loadMoreDistricts = () => {
    setDistrictPage((prevPage) => prevPage + 1);
  };

  const handleScroll = useCallback((e: React.UIEvent<HTMLDivElement>) => {
    const target = e.target as HTMLDivElement;
    if (dataDistrictCluster && target.scrollTop + target.clientHeight >= target.scrollHeight - 50) {
      if (dataDistrictCluster.data.length >= 10 && !isDataDistrictLoading && (dataDistrictCluster.paging.page !== dataDistrictCluster.paging.total_page)) {
        loadMoreDistricts();
      }
    }
  }, [dataDistrictCluster, isDataDistrictLoading]);

  return (
    <>
      <span onClick={() => setIsModalOpen(true)} className="bg-white w-full lg:w-44 h-8 flex cursor-pointer justify-center items-center rounded-xl text-primarypink hover:bg-fourthpink hover:text-white">
        Update
      </span>
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-[625px] max-h-screen overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Address</DialogTitle>
          </DialogHeader>
          {isLoading ? (
            <div>Loading</div>
          ) : (
            <form onSubmit={saveUpdateAddress}>
              <div className="flex flex-col gap-4 py-4">
                <Form {...form}>
                  <FormField
                    control={form.control}
                    name="contact_name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Contact Name</FormLabel>
                        <FormControl>
                          <Input placeholder="Contact Name" value={dataBody.contact_name} onChange={(e) => {
                            const value = e.target.value;
                            setDataBody({ ...dataBody, contact_name: value });
                            field.onChange(value);
                          }} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="contact_phone_number"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Contact Phone Number</FormLabel>
                        <FormControl>
                          <Input
                            onBlur={() => form.trigger('contact_phone_number')}
                            placeholder="Phone Number"
                            onKeyDown={(e) => {
                              const allowedKeys = [
                                "Backspace", "ArrowLeft", "ArrowRight", "Delete", "Tab",
                              ];
                              if (
                                !/[0-9]/.test(e.key) &&
                                !allowedKeys.includes(e.key)
                              ) {
                                e.preventDefault();
                              }
                            }}
                            value={dataBody.contact_phone_number}
                            onChange={(e) => {
                              const value = e.target.value;
                              setDataBody({ ...dataBody, contact_phone_number: value });
                              field.onChange(value);
                            }}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="address"
                    render={({ field }) => (
                      <FormItem>city_id
                        <FormLabel>Address</FormLabel>
                        <FormControl>
                          <Textarea style={{ resize: 'none', height: '80px' }} placeholder="Address" value={dataBody.address} onChange={(e) => {
                            const value = e.target.value;
                            setDataBody({ ...dataBody, address: value });
                            field.onChange(value);
                          }} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="province"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Province</FormLabel>
                        <Select onValueChange={(value) => {
                          setDataBody({ ...dataBody, province: value, city: "", district: "", sub_district: "" });
                          field.onChange(value);
                        }}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder={dataBody.province || "Select a province"} />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {dataProvinceCluster?.data.map((province) => (
                              <SelectItem key={province.id} value={province.name}>
                                {province.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="city"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>City</FormLabel>
                        <Select
                          disabled={!dataCityCluster || dataBody.province === ""}
                          onValueChange={(value) => {
                            const selectedCity = dataCityCluster?.data.find(city => city.name === value);
                            if (selectedCity) {
                              setDataBody({
                                ...dataBody,
                                city: value,
                                city_id: selectedCity.city_id
                              });
                            }
                            field.onChange(value);
                          }}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder={dataBody.city || "Select a city"} />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {dataCityCluster?.data.map((city) => (
                              <SelectItem key={city.id} value={city.name}>
                                {city.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="district"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>District</FormLabel>
                        <Select disabled={!dataDistrictCluster || dataBody.city === ""} onValueChange={(value) => {
                          setDataBody({ ...dataBody, district: value });
                          field.onChange(value);
                        }}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder={dataBody.district || "Select a district"} />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent
                            ref={scrollRef}
                            className="max-h-40 overflow-y-auto"
                            onScrollCapture={handleScroll}
                          >
                            {dataDistrictCluster?.data.map((district) => (
                              <SelectItem key={district.id} value={district.name}>
                                {district.name}
                              </SelectItem>
                            ))}
                            {isDataDistrictLoading && dataDistrictCluster?.paging.page !== dataDistrictCluster?.paging.total_page && (
                              <div className="text-center py-2">
                                <span>Loading...</span>
                              </div>
                            )}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="sub_district"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Sub District</FormLabel>
                        <Select disabled={!dataSubDistrictCluster || dataBody.district === ""} onValueChange={(value) => {
                          setDataBody({ ...dataBody, sub_district: value });
                          field.onChange(value);
                        }}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder={dataBody.sub_district || "Select a sub district"} />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {dataSubDistrictCluster?.data.map((subDistrict) => (
                              <SelectItem key={subDistrict.id} value={subDistrict.name}>
                                {subDistrict.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </Form>
              </div>
              <MapLeaflet
                latitude={dataBody.latitude}
                longitude={dataBody.longitude}
                zoom={18}
                height="400px"
                width="100%"
                handleMarkerDrag={handleMarkerDrag}
              />
              <DialogFooter className="mt-5">
                <Button disabled={isUpdateAddressLoading} variant={"outline"} onClick={() => setIsModalOpen(false)} type="button">Cancel</Button>
                <Button disabled={isUpdateAddressLoading} type="submit" className="bg-primarypink hover:bg-secondarypink">
                  {isUpdateAddressLoading ? "Saving..." : "Save"}
                </Button>
              </DialogFooter>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}

export default ModalUpdateAddress;
