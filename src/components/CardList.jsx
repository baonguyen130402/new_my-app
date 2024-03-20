import axios from "axios";
import { useEffect, useRef, useState } from "react";
import { CardRender } from "./Card";
import debounce from "lodash.debounce";
import {
  Box,
  ButtonGroup,
  Flex,
  IconButton,
  Input,
  InputGroup,
  InputRightElement,
  SimpleGrid,
  Spacer,
  Stack,
  useToast,
} from "@chakra-ui/react";
import { ArrowBackIcon, ArrowForwardIcon, SearchIcon } from "@chakra-ui/icons";

export const CardList = (prop) => {
  const { type } = prop;
  const toast = useToast();
  const cardRendered = useRef(0);

  const [query, setQuery] = useState("");
  const [data, setData] = useState([]);
  const [cartData, setCartData] = useState({});
  const [count, setCount] = useState(20);

  const users = JSON.parse(sessionStorage.getItem("users"));
  const products = JSON.parse(sessionStorage.getItem("products"));
  const carts = JSON.parse(sessionStorage.getItem("carts"));

  const filteredItemUser = JSON.parse(
    sessionStorage.getItem("filteredItemUser"),
  );
  const filteredItemProduct = JSON.parse(
    sessionStorage.getItem("filteredItemProduct"),
  );

  const lastQueryUser = sessionStorage.getItem("lastQueryUser");
  const lastQueryProduct = sessionStorage.getItem("lastQueryProduct");

  const initializeData = ({ type } = prop) => {
    if (type === "users") {
      setData(users.slice(cardRendered.current, cardRendered.current + 20));
    }

    if (type === "products") {
      setData(products.slice(cardRendered.current, cardRendered.current + 20));
    }
  };

  const getDataFirstPage = async (endpoint) => {
    let dataRender;
    let dataGetFromEndpoint;

    if (users === null || products === null) {
      dataGetFromEndpoint = await axios.get(endpoint);
      const d = [];

      if (type === "users") {
        dataGetFromEndpoint.data.users.forEach((user) => {
          d.push({
            id: user.id,
            name: `${user.firstName} ${user.lastName}`,
            image: user.image,
          });
        });

        if (lastQueryUser?.length !== 0) {
          setData(filteredItemUser);
        } else {
          setData(d);
        }
      }

      if (type === "products") {
        dataGetFromEndpoint.data.products.forEach((product) => {
          d.push({
            id: product.id,
            name: product.title,
            image: product.images[0],
          });
        });
        setData(d);
      }
    } else {
      if (type === "users") {
        dataRender = lastQueryUser?.length !== 0
          ? filteredItemUser
          : users.slice(0, 20);
      }

      if (type === "products") {
        dataRender = lastQueryProduct?.length !== 0
          ? filteredItemProduct
          : products.slice(0, 20);
      }

      setData(dataRender);
    }
  };

  const fetchAllData = async (endpoint, type) => {
    const dataGetFromEndpoint = await axios.get(endpoint);

    const d = [];

    if (type === "users") {
      dataGetFromEndpoint.data.users.forEach((user) => {
        d.push({
          id: user.id,
          name: `${user.firstName} ${user.lastName}`,
          image: user.image,
          defaultValueInput: "Boanguye",
        });
      });

      sessionStorage.setItem("users", JSON.stringify(d));
    }

    if (type === "products") {
      dataGetFromEndpoint.data.products.forEach((product) => {
        d.push({
          id: product.id,
          name: `${product.title}`,
          image: product.images[0],
        });
      });

      sessionStorage.setItem("products", JSON.stringify(d));
    }
  };

  const fetchAllDataCart = async (endpoint) => {
    if (carts === null) {
      const dataGetFromEndpoint = await axios.get(endpoint);
      const d = dataGetFromEndpoint.data.carts;
      sessionStorage.setItem("carts", JSON.stringify(d));
      setCartData(d);
    } else {
      setCartData(carts);
    }
  };

  useEffect(() => {
    if (lastQueryUser?.length !== 0) {
      if (type === "users") {
        getFilteredItems(lastQueryUser);
      }
    }

    if (lastQueryProduct?.length !== 0) {
      if (type === "products") {
        getFilteredItems(lastQueryProduct);
      }
    }
  }, []);

  useEffect(() => {
    (async () => {
      try {
        await getDataFirstPage(`https://dummyjson.com/${type}?limit=20`);

        if (users === null || products === null) {
          await fetchAllData(`https://dummyjson.com/${type}?limit=100`, type);
        }
      } catch (err) {
        console.log(err);
      }
    })();
  }, []);

  useEffect(() => {
    (async () => {
      await fetchAllDataCart("https://dummyjson.com/carts");
    })();
  }, []);

  const handleClickPrev = () => {
    if (cardRendered.current !== 0) {
      cardRendered.current -= 20;
    } else {
      toast({
        title: "Can't load!!",
        description: "This is first page.",
        status: "error",
        duration: 1500,
        isClosable: true,
      });
    }

    initializeData({ type });
  };

  const handleClickNext = () => {
    if (cardRendered.current <= 60) {
      cardRendered.current += 20;
    } else {
      toast({
        title: "Can't load more!!",
        description: "This is last page.",
        status: "error",
        duration: 1500,
        isClosable: true,
      });
    }

    initializeData({ type });

    if (cardRendered.current === count) {
      setCount(count + 20);
    }
  };

  const getFilteredItems = (query) => {
    if (type === "users") {
      const d = users?.filter((user) => user.name.includes(query));

      if (query?.length === 0) {
        setData(users?.slice(cardRendered.current, cardRendered.current + 20));
      } else {
        setData(d);
      }
    }

    if (type === "products") {
      const d = products?.filter((product) => product.name.includes(query));

      if (query?.length === 0) {
        setData(
          products?.slice(cardRendered.current, cardRendered.current + 20),
        );
      } else {
        setData(d);
      }
    }
  };

  useEffect(() => {
    if (type === "users") {
      if (query.length === 0 && lastQueryUser?.length !== 0) {
        sessionStorage.setItem("lastQueryUser", lastQueryUser);
      } else {
        sessionStorage.setItem("lastQueryUser", query);
      }
    }

    if (type === "products") {
      if (query.length === 0 && lastQueryProduct?.length !== 0) {
        sessionStorage.setItem("lastQueryProduct", lastQueryProduct);
      } else {
        sessionStorage.setItem("lastQueryProduct", query);
      }
    }

    getFilteredItems(query);
  }, [query]);

  const updateQuery = (e) => setQuery(e?.target?.value);
  const debounceOnChange = debounce(updateQuery, 200);

  return (
    <Box>
      <Flex minWidth="max-content" alignItems="center" gap="2">
        <Spacer />
        <ButtonGroup gap="2">
          <IconButton
            variant="outline"
            bg="btnBg"
            size="md"
            icon={<ArrowBackIcon />}
            onClick={handleClickPrev}
          />
          <IconButton
            variant="outline"
            bg="btnBg"
            size="md"
            icon={<ArrowForwardIcon />}
            onClick={handleClickNext}
          />
        </ButtonGroup>
        <Spacer />
      </Flex>
      <Stack my={3} px={16}>
        <InputGroup>
          <Input
            variant="filled"
            placeholder="Name..."
            defaultValue={type === "products"
              ? lastQueryProduct === "null" ? "" : lastQueryProduct
              : lastQueryUser === "null"
                ? ""
                : lastQueryUser}
            onChange={debounceOnChange}
          />
          <InputRightElement>
            <SearchIcon color="teal" />
          </InputRightElement>
        </InputGroup>
      </Stack>
      {type === "products"
        ? (
          <Stack h={"50vh"} overflowY="auto">
            <SimpleGrid columns={4} spacing={2}>
              {data?.map((dataRender, id) => (
                <CardRender
                  key={id}
                  type="products"
                  data={dataRender}
                  cartData={cartData}
                />
              ))}
            </SimpleGrid>
          </Stack>
        )
        : (
          <Stack h={"85vh"} overflowY="auto">
            <SimpleGrid columns={4} spacing={2}>
              {data?.map((dataRender, id) => (
                <CardRender
                  key={id}
                  type="users"
                  data={dataRender}
                  cartData={cartData}
                />
              ))}
            </SimpleGrid>
          </Stack>
        )}
    </Box>
  );
};
