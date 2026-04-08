--
-- PostgreSQL database dump
--

\restrict IbbnfkZHCg2ZQEyHQrh6AJdLxHRtJ4MuTANFLXAh1Rngqxa9RAA3fIGPK4fk7BQ

-- Dumped from database version 15.16 (Homebrew)
-- Dumped by pg_dump version 18.3

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: op_tours; Type: TABLE; Schema: public; Owner: tronghieuhuynh
--

CREATE TABLE public.op_tours (
    id integer NOT NULL,
    tour_code character varying(100),
    tour_name character varying(500),
    start_date date,
    end_date date,
    market character varying(200),
    status character varying(50) DEFAULT 'Sắp chạy'::character varying,
    total_revenue numeric DEFAULT 0,
    actual_revenue numeric DEFAULT 0,
    total_expense numeric DEFAULT 0,
    actual_expense numeric DEFAULT 0,
    profit numeric DEFAULT 0,
    tour_info jsonb DEFAULT '{}'::jsonb,
    revenues jsonb DEFAULT '[]'::jsonb,
    expenses jsonb DEFAULT '[]'::jsonb,
    guides jsonb DEFAULT '[]'::jsonb,
    itinerary text,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.op_tours OWNER TO tronghieuhuynh;

--
-- Name: op_tours_id_seq; Type: SEQUENCE; Schema: public; Owner: tronghieuhuynh
--

CREATE SEQUENCE public.op_tours_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.op_tours_id_seq OWNER TO tronghieuhuynh;

--
-- Name: op_tours_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: tronghieuhuynh
--

ALTER SEQUENCE public.op_tours_id_seq OWNED BY public.op_tours.id;


--
-- Name: op_tours id; Type: DEFAULT; Schema: public; Owner: tronghieuhuynh
--

ALTER TABLE ONLY public.op_tours ALTER COLUMN id SET DEFAULT nextval('public.op_tours_id_seq'::regclass);


--
-- Data for Name: op_tours; Type: TABLE DATA; Schema: public; Owner: tronghieuhuynh
--

COPY public.op_tours (id, tour_code, tour_name, start_date, end_date, market, status, total_revenue, actual_revenue, total_expense, actual_expense, profit, tour_info, revenues, expenses, guides, itinerary, created_at, updated_at) FROM stdin;
1	TOURFIT_00435	HÀNG CHÂU - Ô TRẤN - TÔ CHÂU - THƯỢNG HẢI	2026-03-21	2026-03-25	Trung Quốc	Sắp chạy	0	0	0	0	0	{"sold": 8, "vehicle": "Hàng không", "reserved": 0, "operators": "Nhân viên điều hành VÍ dụ ", "price_adult": 25490000, "total_seats": 15, "pickup_point": "SGN", "price_infant": 7647000, "dropoff_point": "SGN", "tour_guide_id": 43, "price_child_2_5": 21666500, "tour_guide_name": "Đặng Thanh Phong (Kevin) - 0933103541", "flight_itinerary": "SGN 123", "price_child_6_11": 21666500, "tour_itinerary_link": "http://localhost:3000/op-tours", "price_infant_percent": 30, "terms_and_conditions": "<p>123124</p>\\n", "price_child_2_5_percent": 85, "price_child_6_11_percent": 85}	[{"id": 1, "qty": 2, "cmnd": "", "code": "PVAY09", "debt": 15490000, "name": "Huỳnh Mai Thảo", "paid": 15000000, "phone": "0903388586", "staff": "Nguyễn Quỳnh Phương", "total": 50980000, "status": "Đã đặt cọc", "discount": 0, "adult_qty": 1, "surcharge": 0, "base_price": 50980000, "updated_at": "2026-04-07T15:01:59.473Z", "customer_id": 690, "raw_details": {"members": [{"id": 1775519560891, "dob": "1981-03-30", "name": "Huỳnh Mai Thảo", "note": "", "docId": "", "hotel": "", "phone": "0903388586", "gender": "Nữ", "ageType": "Người lớn", "docType": "CMTND", "flightIn": "", "roomCode": "", "roomType": "-Chọn-", "flightOut": "", "issueDate": "", "expiryDate": "", "visaResult": "", "visaStatus": "-Chọn-", "visaSubmit": ""}, {"id": 1775519562587, "name": "Trần thị Test 7 aprr 652", "phone": "1122414125", "ageType": "Người lớn", "docType": "CMTND"}, {"id": 1775574116742, "dob": "", "name": "Khách 3 (Của Huỳnh Mai Thảo)", "note": "", "docId": "", "hotel": "", "phone": "", "gender": "Chọn", "ageType": "Người lớn", "docType": "CMTND", "flightIn": "", "roomCode": "", "roomType": "-Chọn-", "flightOut": "", "issueDate": "", "expiryDate": "", "visaResult": "", "visaStatus": "-Chọn-", "visaSubmit": ""}], "bookingInfo": {"bank": "Chọn", "name": "Huỳnh Mai Thảo", "phone": "0903388586", "branch": "Chi Nhánh", "gender": "Nữ", "pickup": "", "search": "0903388586", "agentTA": "Chọn", "dropoff": "", "agentCode": "", "customerId": 690, "reservationCode": "ECWSQD"}, "pricingRows": [{"id": 1, "qty": 2, "name": "", "price": 25490000, "total": 50980000, "comCTV": 0, "ageType": "Người lớn", "discount": 0, "comPerPax": 0, "surcharge": 0, "customerNote": "", "internalNote": ""}, {"id": 2, "qty": 0, "name": "", "price": 0, "total": 0, "comCTV": 0, "ageType": "Trẻ em (6 - 11)", "discount": 0, "comPerPax": 0, "surcharge": 0, "customerNote": "", "internalNote": ""}, {"id": 3, "qty": 0, "name": "", "price": 0, "total": 0, "comCTV": 0, "ageType": "Trẻ em (2 - 5)", "discount": 0, "comPerPax": 0, "surcharge": 0, "customerNote": "", "internalNote": ""}, {"id": 4, "qty": 0, "name": "", "price": 0, "total": 0, "comCTV": 0, "ageType": "Trẻ nhỏ", "discount": 0, "comPerPax": 0, "surcharge": 0, "customerNote": "", "internalNote": ""}]}, "customer_name": "PHAM VU NGOC TUYEN"}, {"id": "BK_1775573609366_151", "qty": 1, "cmnd": "", "name": "Nguyen Thi Mai Thy", "paid": 0, "phone": "0902585066", "total": 25490000, "status": "Giữ chỗ", "discount": 0, "surcharge": 0, "base_price": 25490000, "created_at": "2026-04-07T14:53:29.367Z", "created_by": 1, "customer_id": 696, "raw_details": {"members": [{"id": 1775573523633, "dob": "1981-08-05", "name": "Nguyen Thi Mai Thy", "note": "", "docId": "", "hotel": "", "phone": "0902585066", "gender": "Nữ", "ageType": "Người lớn", "docType": "CMTND", "flightIn": "", "roomCode": "", "roomType": "-Chọn-", "flightOut": "", "issueDate": "", "expiryDate": "", "visaResult": "", "visaStatus": "-Chọn-", "visaSubmit": ""}], "bookingInfo": {"bank": "Chọn", "name": "Nguyen Thi Mai Thy", "phone": "0902585066", "branch": "Chi Nhánh", "gender": "Nữ", "pickup": "", "search": "0902585066", "agentTA": "Chọn", "dropoff": "", "agentCode": "", "customerId": 696, "reservationCode": "ECWSQD"}, "pricingRows": [{"id": 1, "qty": 1, "name": "", "price": 25490000, "total": 25490000, "comCTV": 0, "ageType": "Người lớn", "discount": 0, "comPerPax": 0, "surcharge": 0, "customerNote": "", "internalNote": ""}, {"id": 2, "qty": 0, "name": "", "price": 0, "total": 0, "comCTV": 0, "ageType": "Trẻ em (6 - 11)", "discount": 0, "comPerPax": 0, "surcharge": 0, "customerNote": "", "internalNote": ""}, {"id": 3, "qty": 0, "name": "", "price": 0, "total": 0, "comCTV": 0, "ageType": "Trẻ em (2 - 5)", "discount": 0, "comPerPax": 0, "surcharge": 0, "customerNote": "", "internalNote": ""}, {"id": 4, "qty": 0, "name": "", "price": 0, "total": 0, "comCTV": 0, "ageType": "Trẻ nhỏ", "discount": 0, "comPerPax": 0, "surcharge": 0, "customerNote": "", "internalNote": ""}]}}, {"id": "BK_1775574133410_283", "qty": 3, "cmnd": "", "name": "Dao Nguyen Hoai Thuong", "paid": 0, "phone": "0786850845", "total": 76470000, "status": "Giữ chỗ", "discount": 0, "surcharge": 0, "base_price": 76470000, "created_at": "2026-04-07T15:02:13.410Z", "created_by": 1, "updated_at": "2026-04-07T15:02:36.010Z", "customer_id": 721, "raw_details": {"members": [{"id": 1775574122244, "dob": "1997-06-24", "name": "Dao Nguyen Hoai Thuong", "note": "", "docId": "", "hotel": "", "phone": "0786850845", "gender": "Nữ", "ageType": "Người lớn", "docType": "CMTND", "flightIn": "", "roomCode": "", "roomType": "-Chọn-", "flightOut": "", "issueDate": "", "expiryDate": "", "visaResult": "", "visaStatus": "-Chọn-", "visaSubmit": ""}, {"id": 1775574123665, "dob": "", "name": "gjkj 2 (Của Dao Nguyen Hoai Thuong)", "note": "", "docId": "", "hotel": "", "phone": "", "gender": "Chọn", "ageType": "Người lớn", "docType": "CMTND", "flightIn": "", "roomCode": "", "roomType": "-Chọn-", "flightOut": "", "issueDate": "", "expiryDate": "", "visaResult": "", "visaStatus": "-Chọn-", "visaSubmit": ""}, {"id": 1775574123820, "dob": "", "name": "Khách 3 (Của Dao Nguyen Hoai Thuong)", "note": "", "docId": "", "hotel": "", "phone": "", "gender": "Chọn", "ageType": "Người lớn", "docType": "CMTND", "flightIn": "", "roomCode": "", "roomType": "-Chọn-", "flightOut": "", "issueDate": "", "expiryDate": "", "visaResult": "", "visaStatus": "-Chọn-", "visaSubmit": ""}], "bookingInfo": {"bank": "Chọn", "name": "Dao Nguyen Hoai Thuong", "phone": "0786850845", "branch": "Chi Nhánh", "gender": "Nữ", "pickup": "", "search": "0786850845", "agentTA": "Chọn", "dropoff": "", "agentCode": "", "customerId": 721, "reservationCode": "ECWSQD"}, "pricingRows": [{"id": 1, "qty": 3, "name": "", "price": 25490000, "total": 76470000, "comCTV": 0, "ageType": "Người lớn", "discount": 0, "comPerPax": 0, "surcharge": 0, "customerNote": "", "internalNote": ""}, {"id": 2, "qty": 0, "name": "", "price": 0, "total": 0, "comCTV": 0, "ageType": "Trẻ em (6 - 11)", "discount": 0, "comPerPax": 0, "surcharge": 0, "customerNote": "", "internalNote": ""}, {"id": 3, "qty": 0, "name": "", "price": 0, "total": 0, "comCTV": 0, "ageType": "Trẻ em (2 - 5)", "discount": 0, "comPerPax": 0, "surcharge": 0, "customerNote": "", "internalNote": ""}, {"id": 4, "qty": 0, "name": "", "price": 0, "total": 0, "comCTV": 0, "ageType": "Trẻ nhỏ", "discount": 0, "comPerPax": 0, "surcharge": 0, "customerNote": "", "internalNote": ""}]}}, {"id": "BK_1775574852869_744", "qty": 3, "cmnd": "", "name": "Huỳnh Mai Thảo", "paid": 0, "phone": "0903388586", "total": 76470000, "status": "Giữ chỗ", "discount": 0, "surcharge": 0, "base_price": 76470000, "created_at": "2026-04-07T15:14:12.869Z", "created_by": 1, "customer_id": 690, "raw_details": {"members": [{"id": 1775574845174, "dob": "1981-03-30", "name": "Huỳnh Mai Thảo", "note": "", "docId": "", "hotel": "", "phone": "0903388586", "gender": "Nữ", "ageType": "Người lớn", "docType": "CMTND", "flightIn": "", "roomCode": "", "roomType": "-Chọn-", "flightOut": "", "issueDate": "", "expiryDate": "", "visaResult": "", "visaStatus": "-Chọn-", "visaSubmit": ""}, {"id": 1775574849647, "dob": "", "name": "Khách 2 (Của Huỳnh Mai Thảo)", "note": "", "docId": "", "hotel": "", "phone": "", "gender": "Chọn", "ageType": "Người lớn", "docType": "CMTND", "flightIn": "", "roomCode": "", "roomType": "-Chọn-", "flightOut": "", "issueDate": "", "expiryDate": "", "visaResult": "", "visaStatus": "-Chọn-", "visaSubmit": ""}, {"id": 1775574849865, "dob": "", "name": "Khách 3 (Của Huỳnh Mai Thảo)", "note": "", "docId": "", "hotel": "", "phone": "", "gender": "Chọn", "ageType": "Người lớn", "docType": "CMTND", "flightIn": "", "roomCode": "", "roomType": "-Chọn-", "flightOut": "", "issueDate": "", "expiryDate": "", "visaResult": "", "visaStatus": "-Chọn-", "visaSubmit": ""}], "bookingInfo": {"bank": "Chọn", "name": "Huỳnh Mai Thảo", "phone": "0903388586", "branch": "Chi Nhánh", "gender": "Nữ", "pickup": "", "search": "0903388586", "agentTA": "Chọn", "dropoff": "", "agentCode": "", "customerId": 690, "reservationCode": "ECWSQD"}, "pricingRows": [{"id": 1, "qty": 3, "name": "", "price": 25490000, "total": 76470000, "comCTV": 0, "ageType": "Người lớn", "discount": 0, "comPerPax": 0, "surcharge": 0, "customerNote": "", "internalNote": ""}, {"id": 2, "qty": 0, "name": "", "price": 0, "total": 0, "comCTV": 0, "ageType": "Trẻ em (6 - 11)", "discount": 0, "comPerPax": 0, "surcharge": 0, "customerNote": "", "internalNote": ""}, {"id": 3, "qty": 0, "name": "", "price": 0, "total": 0, "comCTV": 0, "ageType": "Trẻ em (2 - 5)", "discount": 0, "comPerPax": 0, "surcharge": 0, "customerNote": "", "internalNote": ""}, {"id": 4, "qty": 0, "name": "", "price": 0, "total": 0, "comCTV": 0, "ageType": "Trẻ nhỏ", "discount": 0, "comPerPax": 0, "surcharge": 0, "customerNote": "", "internalNote": ""}]}}]	{}	{}	\N	2026-04-06 22:10:59.072138	2026-04-08 05:16:07.778605
2	124	Tour Giang Nam 5 ngày 4 đêm	2026-04-08	2026-04-15		Đang chạy	0	0	0	0	0	{"sold": 0, "dep_airline": "Vietnam Airlines", "price_adult": 0, "ret_airline": "Vietnam Airlines", "total_seats": 0, "commission_type": "%", "flight_itinerary": "1.  MU870     SA21MAR   SGNHGH HK16  0200 0705;                      2.  MU281     WE25MAR  PVGSGN HK16  2135 0110+1"}	[{"id": "BK_1775574866223_267", "qty": 5, "cmnd": "", "name": "Thanh Dung", "paid": 0, "phone": "0858385509", "total": 180450000, "status": "Giữ chỗ", "discount": 0, "surcharge": 0, "base_price": 180450000, "created_at": "2026-04-07T15:14:26.223Z", "created_by": 1, "updated_at": "2026-04-07T16:08:37.919Z", "customer_id": 695, "raw_details": {"members": [{"id": 1775574858223, "dob": "", "name": "Thanh Dung", "note": "", "docId": "", "hotel": "", "phone": "0858385509", "gender": "Nam", "ageType": "Người lớn", "docType": "CMTND", "flightIn": "", "roomCode": "", "roomType": "-Chọn-", "flightOut": "", "issueDate": "", "expiryDate": "", "visaResult": "", "visaStatus": "-Chọn-", "visaSubmit": ""}, {"id": 1775574860563, "dob": "", "name": "Khách 2 (Của Thanh Dung)", "note": "", "docId": "", "hotel": "", "phone": "", "gender": "Chọn", "ageType": "Người lớn", "docType": "CMTND", "flightIn": "", "roomCode": "", "roomType": "-Chọn-", "flightOut": "", "issueDate": "", "expiryDate": "", "visaResult": "", "visaStatus": "-Chọn-", "visaSubmit": ""}, {"id": 1775574860747, "dob": "", "name": "Khách 3 (Của Thanh Dung)", "note": "", "docId": "", "hotel": "", "phone": "", "gender": "Chọn", "ageType": "Người lớn", "docType": "CMTND", "flightIn": "", "roomCode": "", "roomType": "-Chọn-", "flightOut": "", "issueDate": "", "expiryDate": "", "visaResult": "", "visaStatus": "-Chọn-", "visaSubmit": ""}, {"id": 1775578000492, "name": "Khách 4 (Của Thanh Dung)", "ageType": "Người lớn", "docType": "CMTND"}, {"id": 1775578000493, "name": "Khách 5 (Của Thanh Dung)", "ageType": "Người lớn", "docType": "CMTND"}], "bookingInfo": {"bank": "Chọn", "name": "Thanh Dung", "phone": "0858385509", "branch": "Chi Nhánh", "gender": "Nam", "pickup": "", "search": "0858385509", "agentTA": "Chọn", "dropoff": "", "agentCode": "", "customerId": 695, "reservationCode": "ECWSQD"}, "pricingRows": [{"id": 1, "qty": 2, "name": "", "price": 25490000, "total": 80980000, "comCTV": 0, "ageType": "Người lớn", "discount": 0, "comPerPax": 0, "surcharge": 0, "customerNote": "", "internalNote": "", "extraServices": [{"id": 1775577953076, "qty": 2, "name": "Dịch vụ cho A", "price": 15000000, "total": 30000000}]}, {"id": 1775577965854, "qty": 3, "name": "", "price": 25490000, "total": 99470000, "comCTV": 0, "ageType": "Người lớn", "discount": 0, "comPerPax": 0, "surcharge": 0, "customerNote": "", "internalNote": "", "extraServices": [{"id": 1775578002262, "qty": 2, "name": "124124", "price": 11500000, "total": 23000000}]}, {"id": 2, "qty": 0, "name": "", "price": 0, "total": 0, "comCTV": 0, "ageType": "Trẻ em (6 - 11)", "discount": 0, "comPerPax": 0, "surcharge": 0, "customerNote": "", "internalNote": "", "extraServices": []}, {"id": 3, "qty": 0, "name": "", "price": 0, "total": 0, "comCTV": 0, "ageType": "Trẻ em (2 - 5)", "discount": 0, "comPerPax": 0, "surcharge": 0, "customerNote": "", "internalNote": "", "extraServices": []}, {"id": 4, "qty": 0, "name": "", "price": 0, "total": 0, "comCTV": 0, "ageType": "Trẻ nhỏ", "discount": 0, "comPerPax": 0, "surcharge": 0, "customerNote": "", "internalNote": "", "extraServices": []}]}}]	{}	{}	\N	2026-04-07 07:31:36.789409	2026-04-08 06:57:45.24131
\.


--
-- Name: op_tours_id_seq; Type: SEQUENCE SET; Schema: public; Owner: tronghieuhuynh
--

SELECT pg_catalog.setval('public.op_tours_id_seq', 2, true);


--
-- Name: op_tours op_tours_pkey; Type: CONSTRAINT; Schema: public; Owner: tronghieuhuynh
--

ALTER TABLE ONLY public.op_tours
    ADD CONSTRAINT op_tours_pkey PRIMARY KEY (id);


--
-- PostgreSQL database dump complete
--

\unrestrict IbbnfkZHCg2ZQEyHQrh6AJdLxHRtJ4MuTANFLXAh1Rngqxa9RAA3fIGPK4fk7BQ

