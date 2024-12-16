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
import { postNewAddress } from "@/stores/slices/addressSlices/addressSlice";
import { getMe } from "@/stores/slices/authSlices/authSlice";
import { IoMdAdd } from "react-icons/io";
import { useCallback, useEffect, useRef, useState } from "react";
import MapLeaflet from "@/components/ui/map-leaflet";
import { getCity, getDistrict, getProvince, getSubDistrict } from "@/stores/slices/addressSlices/clusterSlice";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { LocationDataNominatim } from "@/@types/address/cluster";

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

function ModalAddAddress() {
  const scrollRef = useRef<HTMLDivElement>(null);
  const dispatch = useDispatch<AppDispatch>();
  const [cookies] = useCookies(['access_token']);
  const [dataBody, setDataBody] = useState({
    contact_name: "",
    contact_phone_number: "",
    address: "",
    province: "",
    city: "",
    city_id: 0,
    district: "",
    sub_district: "",
    latitude: "-6.2088",
    longitude: "106.8456",
  });
  const [isModalOpen, setIsModalOpen] = useState(false);
  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
  });
  const { isAddMyAddressError, isAddMyAddressLoading } = useSelector((state: RootState) => state.addressReducer);
  const {
    dataProvinceCluster,
    dataCityCluster,
    dataDistrictCluster,
    dataSubDistrictCluster,
    isDataDistrictLoading
  } = useSelector((state: RootState) => state.clusterReducer);
  const [districtPage, setDistrictPage] = useState(1);
  const [latLong, setLatLong] = useState({
    lat: "-6.2088",
    long: "106.8456"
  })

  const handleMarkerDrag = (event: any) => {
    const { lat, lng } = event.target.getLatLng();
    setLatLong({
      lat: lat.toString(),
      long: lng.toString(),
    })
  };

  const saveUpdateAddress = form.handleSubmit(async (data) => {
    setDataBody({
      ...dataBody,
      ...data,
    });

    try {
      await dispatch(postNewAddress(cookies.access_token, {
        contact_name: dataBody.contact_name,
        contact_phone_number: dataBody.contact_phone_number,
        address: dataBody.address,
        province: dataBody.province,
        city: dataBody.contact_phone_number,
        city_id: dataBody.city_id,
        district: dataBody.district,
        sub_district: dataBody.sub_district,
        latitude: latLong.lat,
        longitude: latLong.long,
      }));
      if (!isAddMyAddressError) {
        setDataBody({
          ...dataBody,
          city: "",
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

  const handleAutoFill = async () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(async (position) => {
        const { latitude, longitude } = position.coords;
        try {
          const response = await fetch(`https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json&accept-language=id-ID`);
          const data: LocationDataNominatim = await response.json();

          if (data && data.address) {
            const address = data.address;
            form.setValue("address", data.display_name || "");
            form.setValue("province", address.region || "");
            form.setValue("city", address.city || "");
            form.setValue("district", address.city_district || "");
            form.setValue("sub_district", address.neighbourhood || "");
            setDataBody(() => ({
              ...dataBody,
              address: data.display_name || "",
              province: address.region || "",
              city: address.city || "",
              district: address.city_district || "",
              sub_district: address.neighbourhood || "",
              latitude: latitude.toString(),
              longitude: longitude.toString(),
            }));

            setLatLong({
              lat: latitude.toString(),
              long: longitude.toString(),
            })
          }
        } catch (error) {
          console.error("Error auto-filling the address:", error);
        }
      }, (error) => {
        console.error("Error getting location:", error);
      });
    } else {
      console.error("Geolocation is not supported by this browser.");
    }
  };

  const handleScroll = useCallback((e: React.UIEvent<HTMLDivElement>) => {
    const target = e.target as HTMLDivElement;
    if (dataDistrictCluster && target.scrollTop + target.clientHeight >= target.scrollHeight - 50) {
      if (dataDistrictCluster.data.length >= 10 && !isDataDistrictLoading && (dataDistrictCluster.paging.page !== dataDistrictCluster.paging.total_page)) {
        loadMoreDistricts();
      }
    }
  }, [dataDistrictCluster, isDataDistrictLoading]);

  const loadMoreDistricts = () => {
    setDistrictPage((prevPage) => prevPage + 1);
  };

  useEffect(() => {
    if (isModalOpen) {
      dispatch(getProvince(cookies.access_token, 10, 1, false));
    }
  }, [isModalOpen]);

  useEffect(() => {
    if (dataBody.province !== "") {
      dispatch(getCity(cookies.access_token, 10, 1, dataBody.province, false));
      setDataBody((prev) => ({ ...prev, city: "", district: "", sub_district: "" }));
      form.setValue('city', "");
      form.setValue('district', "");
      form.setValue('sub_district', "");
    }
  }, [dataBody.province]);

  useEffect(() => {
    if (dataBody.city !== "") {
      dispatch(getDistrict(cookies.access_token, 10, 1, dataBody.province, dataBody.city, false));
      setDataBody((prev) => ({ ...prev, district: "", sub_district: "" }));
      form.setValue('district', "");
      form.setValue('sub_district', "");
    }
  }, [dataBody.city]);

  useEffect(() => {
    if (dataBody.district !== "") {
      dispatch(getSubDistrict(cookies.access_token, 10, 1, dataBody.province, dataBody.city, dataBody.district, false));
      setDataBody((prev) => ({ ...prev, sub_district: "" }));
      form.setValue('sub_district', "");
    }
  }, [dataBody.district]);

  useEffect(() => {
    if (dataBody.city !== "" && districtPage > 1) {
      dispatch(getDistrict(cookies.access_token, 10, districtPage, dataBody.province, dataBody.city, true));
    }
  }, [districtPage]);

  return (
    <>
      <span onClick={() => setIsModalOpen(true)} className="bg-primarypink hover:bg-thirdpink w-36 h-8 flex gap-2 cursor-pointer justify-center items-center rounded-xl text-white font-semibold">
        <IoMdAdd className="font-bold" />
        <span>Add</span>
      </span>
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-[625px] max-h-screen overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Add New Address</DialogTitle>
          </DialogHeader>
          <form onSubmit={saveUpdateAddress}>
            <Button className="bg-primarypink hover:bg-secondarypink" type="button" onClick={handleAutoFill}>Auto fill</Button>
            <div className="flex flex-col gap-4 py-4">
              <Form {...form}>
                <FormField
                  control={form.control}
                  name="contact_name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Contact Name</FormLabel>
                      <FormControl>
                        <Input placeholder="Contact Name" onChange={(e) => {
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
                    <FormItem>
                      <FormLabel>Address</FormLabel>
                      <FormControl>
                        <Textarea style={{ resize: 'none', height: '80px' }} placeholder="Address" onChange={(e) => {
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
                            <SelectValue placeholder="Select a province" />
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
                        value={dataBody.city}
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
                            <SelectValue placeholder="Select a city" />
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
                      <Select value={dataBody.district} disabled={!dataDistrictCluster || dataBody.city === ""} onValueChange={(value) => {
                        setDataBody({ ...dataBody, district: value });
                        field.onChange(value);
                      }}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a district" />
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
                      <Select value={dataBody.sub_district} disabled={!dataSubDistrictCluster || dataBody.district === ""} onValueChange={(value) => {
                        setDataBody({ ...dataBody, sub_district: value });
                        field.onChange(value);
                      }}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a sub district" />
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
              latitude={latLong.lat}
              longitude={latLong.long}
              zoom={18}
              height='400px'
              width='100%'
              handleMarkerDrag={handleMarkerDrag}
            />
            <DialogFooter className="mt-5">
              <Button disabled={isAddMyAddressLoading} variant={"outline"} onClick={() => setIsModalOpen(false)} type="button">Cancel</Button>
              <Button disabled={isAddMyAddressLoading} type="submit" className="bg-primarypink hover:bg-secondarypink">{isAddMyAddressLoading ? "Saving..." : "Save"}</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}

export default ModalAddAddress;
