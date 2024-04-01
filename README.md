# Documentação do "Teste de Pedidos Pendentes"
Introdução
Bem-vindo à documentação "Teste de Pedidos Pendentes".
Este teste foi realizado com NodeJS com auxilio do express para realizar uma APIREST.


# Instalação
Para instalar o sistema, você pode usar o gerenciador npm ou yarn Basta executar o seguinte comando:

num insall
yarn install



versão do node: v20.11.1
versão da npm: 10.5.0
versão do yarn: 1.22.19



Uso Básico
Para poder rodar o sistema é necessário após a instalação rodar o comando:

npm run devstart

# .env
Por padrão ele roda na http://localhost:3000, porém se preferir pode adicionar um arquivo .env para setar a porta de sua preferencia, ou a origem a ser permitida pelo cors.

PORT=4200
CORS_ORIGIN=http://localhost:4200

# API
Para podermos visualizar melhor os arquivos, foi disponibilizado uma API somente com funcões GET.


## VISUALIZANDO TODAS AS NOTAS
http://localhost:3000/notas
![image](https://github.com/Mariamacedo-prog/TesteNotas-NodeJS/assets/69858181/35f5005f-85ae-4aa0-b8b3-bdd3de431e82)


## VISUALIZANDO TODOS OS ITENS ENCONTRADOS PARA O PEDIDO, o parametro "id" refere-se ao id do pedido.
http://localhost:3000/notas?id=1
![image](https://github.com/Mariamacedo-prog/TesteNotas-NodeJS/assets/69858181/432749cb-30d2-4fb6-aa9c-08f357aff691)


## VISUALIZANDO TODOS OS PEDIDOS
http://localhost:3000/pedidos
![image](https://github.com/Mariamacedo-prog/TesteNotas-NodeJS/assets/69858181/231505ad-d129-4ea7-bf4b-96fe5e078a3a)


## VISUALIZANDO TODOS OS PEDIDOS-PENDENTES
http://localhost:3000/notas-pendentes
![image](https://github.com/Mariamacedo-prog/TesteNotas-NodeJS/assets/69858181/61a2bef3-7687-4d9a-9ebc-2657ab226c37)

Ao acessar esse endpoint "/notas-pendentes" ele gera automaticamente no path do sistema o arquivo itens_pendentes.txt
![image](https://github.com/Mariamacedo-prog/TesteNotas-NodeJS/assets/69858181/e40613e8-052f-4d67-b31b-2fdf12558888)


