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

interface OtpPopupProps {
  visible: boolean;
  onClose?: () => void;
  onSubmit: (otp: string) => void;
}

export default function OtpPopup({
  visible,
  onClose,
  onSubmit,
}: OtpPopupProps) {
  const handleComplete = (value: string) => {
    onSubmit(value);
    onClose?.();
  };

  return (
    <Modal isOpen={visible} onClose={() => onClose?.()}>
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
