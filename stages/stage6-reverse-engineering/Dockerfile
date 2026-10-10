FROM ubuntu:22.04

ENV DEBIAN_FRONTEND=noninteractive

#install penSSH server and basic binary analysis utilities
RUN apt-get update && apt-get install -y --no-install-recommends \
    openssh-server \
    binutils \
    gdb \
    strace \
    ltrace \
    file \
    && rm -rf /var/lib/apt/lists/*

#configure SSH privilege separation directory and host keys
RUN mkdir -p /var/run/sshd && \
    ssh-keygen -A

RUN sed -i 's@session\s*required\s*pam_loginuid.so@session optional pam_loginuid.so@g' /etc/pam.d/sshd && \
    sed -i 's/#PasswordAuthentication yes/PasswordAuthentication yes/' /etc/ssh/sshd_config && \
    echo "PasswordAuthentication yes" >> /etc/ssh/sshd_config && \
    echo "PermitEmptyPasswords no" >> /etc/ssh/sshd_config

RUN useradd -m -s /bin/bash player && \
    echo "player:password123" | chpasswd

#deploy ermissions
RUN mkdir -p /home/player/challenges/stage6
COPY target.bin /home/player/challenges/stage6/target.bin
RUN chmod 755 /home/player/challenges/stage6/target.bin

#welcome message
RUN printf "============================================================\n   ShadowNet CTF - Stage 06: Reverse Engineering Sandbox\n============================================================\n" > /home/player/README.txt && \
    echo "cat /home/player/README.txt" >> /home/player/.bashrc && \
    chown -R player:player /home/player

EXPOSE 22

CMD ["/usr/sbin/sshd", "-D"]
