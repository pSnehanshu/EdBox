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
  //  onSubmit
  //  description
  //  phoneNo
}
const handleComplete = () => {
  console.log("aab");
};

export default function OtpPopup({ visible, onClose }: props) {
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
