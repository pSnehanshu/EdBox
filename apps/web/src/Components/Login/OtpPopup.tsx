import { useState } from "react";
import {
  Button,
  HStack,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  PinInput,
  PinInputField,
} from "@chakra-ui/react";

interface props {
  visible: boolean;
  onClose?: () => void;
  onSubmit: (otp: any) => void;
  //  description
  //  phoneNo
}

export default function OtpPopup({ visible, onClose, onSubmit }: props) {
  const [otp, setOtp] = useState<string | null>(null);

  const handleComplete = (value: any) => {
    // console.log(value);
    onSubmit(value);
    // onClose && onClose();
  };

  return (
    <Modal isOpen={visible} onClose={() => onClose && onClose()}>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Submit OTP</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <HStack>
            <PinInput otp onComplete={handleComplete}>
              <PinInputField />
              <PinInputField />
              <PinInputField />
              <PinInputField />
              <PinInputField />
              <PinInputField />
            </PinInput>
          </HStack>
        </ModalBody>

        <ModalFooter>
          <Button colorScheme="blue" mr={3} onClick={onClose}>
            Close
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}
